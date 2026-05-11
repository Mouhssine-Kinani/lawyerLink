from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
import stripe
import json

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import require_role
from app.user.model import User
from app.payment.model import PaymentTransaction, PaymentType, PaymentStatus
from app.payment import service

router = APIRouter(prefix="/payments", tags=["Payments"])

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


PLAN_PRICES = {"basic": 0, "pro": 299, "elite": 499}


@router.post("/subscription")
def create_subscription_intent(
    plan: str = "pro",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lawyer"))
):
    if plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan. Choose: basic, pro, elite")
    
    amount = 0 if settings.STRIPE_TEST_MODE else PLAN_PRICES[plan]
    
    result = service.create_stripe_intent(
        db=db,
        user_id=current_user.id,
        amount=amount,
        payment_type="subscription",
        details={"plan_type": plan}
    )
    
    db.commit()
    
    return result


@router.post("/boost")
def create_boost_intent(
    boost_level: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lawyer"))
):
    if boost_level < 1 or boost_level > 5:
        raise HTTPException(status_code=400, detail="boost_level must be 1-5")
    
    # Check if lawyer has active subscription
    from app.payment.model import Subscription, SubscriptionStatus
    subscription = db.query(Subscription).filter(
        Subscription.lawyer_id == current_user.id,
        Subscription.status == SubscriptionStatus.active
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=400, 
            detail="Active subscription required to purchase boost"
        )
    
    amount = 0 if settings.STRIPE_TEST_MODE else (49.00 * boost_level)
    
    result = service.create_stripe_intent(
        db=db,
        user_id=current_user.id,
        amount=amount,
        payment_type="boost",
        details={"boost_level": boost_level}
    )
    
    db.commit()
    
    return result


@router.get("/history")
def get_payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lawyer"))
):
    transactions = db.query(PaymentTransaction).filter(
        PaymentTransaction.payer_id == current_user.id
    ).order_by(PaymentTransaction.id.desc()).all()
    
    return [
        {
            "id": t.id,
            "amount": float(t.amount),
            "type": t.type.value,
            "status": t.status.value
        }
        for t in transactions
    ]


@router.get("/subscription/me")
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lawyer"))
):
    return service.get_subscription_status(db, current_user.id)


@router.post("/subscription/renew")
def renew_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lawyer"))
):
    amount = 0 if settings.STRIPE_TEST_MODE else 299.00
    
    client_secret = service.create_stripe_intent(
        db=db,
        user_id=current_user.id,
        amount=amount,
        payment_type="subscription",
        details={"renew": "true"}
    )
    
    return {"client_secret": client_secret}


@router.post("/subscription/cancel")
def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lawyer"))
):
    from app.payment.model import Subscription, SubscriptionStatus
    
    subscription = db.query(Subscription).filter(
        Subscription.lawyer_id == current_user.id,
        Subscription.status == SubscriptionStatus.active
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    subscription.status = SubscriptionStatus.cancelled
    db.commit()
    
    return {"message": "Subscription cancelled successfully"}


@router.post("/test/simulate-success")
def simulate_payment_success(
    transaction_id: int,
    payment_type: str,
    plan_type: str = "pro",
    boost_level: int = 1,
    db: Session = Depends(get_db)
):
    """
    Test endpoint to simulate successful payment without Stripe.
    Use query params: ?transaction_id=8&payment_type=subscription&plan_type=pro
    """
    transaction = db.query(PaymentTransaction).filter(
        PaymentTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    user_id = transaction.payer_id
    
    if payment_type == "subscription":
        service.handle_subscription_payment(
            db=db,
            transaction=transaction,
            user_id=user_id,
            plan_type=plan_type
        )
    elif payment_type == "boost":
        service.handle_boost_payment(
            db=db,
            transaction=transaction,
            user_id=user_id,
            boost_level=boost_level
        )
    
    db.commit()
    
    return {"message": f"Payment simulation complete for {payment_type}"}


# =============================================================================
# WEBHOOK HANDLER
# =============================================================================

@router.post("/webhook")
async def handle_stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Stripe webhook handler.
    
    For test mode (STRIPE_TEST_MODE=true), we use simplified parsing.
    For production, proper signature verification should be used.
    """
    payload = await request.body()
    
    # In test mode, parse JSON without signature verification
    # This allows Stripe CLI to work
    if settings.STRIPE_TEST_MODE:
        try:
            event_data = json.loads(payload)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON")
        
        event_type = event_data.get("type")
        event_obj = event_data.get("data", {}).get("object", {})
        
    else:
        # Production: verify signature
        try:
            event = stripe.Webhook.construct_event(
                payload,
                stripe_signature or "",
                settings.STRIPE_WEBHOOK_SECRET
            )
            event_type = event["type"]
            event_obj = event["data"]["object"]
        except (ValueError, stripe.error.SignatureVerificationError):
            raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle payment_intent.succeeded
    if event_type == "payment_intent.succeeded":
        transaction_id = event_obj.get("metadata", {}).get("transaction_id")
        payment_type = event_obj.get("metadata", {}).get("payment_type")
        user_id = event_obj.get("metadata", {}).get("user_id")
        
        if not transaction_id or not payment_type or not user_id:
            return {"received": True}
        
        transaction = db.query(PaymentTransaction).filter(
            PaymentTransaction.id == int(transaction_id)
        ).first()
        
        if not transaction:
            return {"received": True}
        
        if payment_type == "subscription":
            service.handle_subscription_payment(
                db=db,
                transaction=transaction,
                user_id=int(user_id)
            )
        elif payment_type == "boost":
            boost_level = int(event_obj.get("metadata", {}).get("boost_level", 1))
            service.handle_boost_payment(
                db=db,
                transaction=transaction,
                user_id=int(user_id),
                boost_level=boost_level
            )
        
        db.commit()
    
    # Handle setup_intent.succeeded (for test mode with 0 amount)
    elif event_type == "setup_intent.succeeded":
        transaction_id = event_obj.get("metadata", {}).get("transaction_id")
        payment_type = event_obj.get("metadata", {}).get("payment_type")
        user_id = event_obj.get("metadata", {}).get("user_id")
        
        if not transaction_id or not payment_type or not user_id:
            return {"received": True}
        
        transaction = db.query(PaymentTransaction).filter(
            PaymentTransaction.id == int(transaction_id)
        ).first()
        
        if not transaction:
            return {"received": True}
        
        if payment_type == "subscription":
            service.handle_subscription_payment(
                db=db,
                transaction=transaction,
                user_id=int(user_id)
            )
        elif payment_type == "boost":
            boost_level = int(event_obj.get("metadata", {}).get("boost_level", 1))
            service.handle_boost_payment(
                db=db,
                transaction=transaction,
                user_id=int(user_id),
                boost_level=boost_level
            )
        
        db.commit()
    
    return {"received": True}