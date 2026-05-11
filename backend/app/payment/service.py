import stripe
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import date, datetime, timedelta

from app.core.config import settings
from app.payment.model import PaymentTransaction, PaymentType, PaymentStatus, Subscription, SubscriptionStatus, BoostPayment

# Set API key at runtime to ensure settings are loaded
stripe.api_key = settings.STRIPE_SECRET_KEY

def create_stripe_intent(
    db: Session,
    user_id: int,
    amount: Decimal,
    payment_type: str,
    details: dict = None
) -> dict:
    """
    Create a Stripe PaymentIntent and corresponding PaymentTransaction.
    
    Returns:
        dict: Containing client_secret and transaction_id
    """
    # Convert amount to cents (Stripe requires integer)
    amount_cents = int(float(amount) * 100) if amount > 0 else 0
    
    # Create PaymentTransaction first (with pending status)
    transaction = PaymentTransaction(
        payer_id=user_id,
        amount=amount,
        type=PaymentType(payment_type),
        status=PaymentStatus.pending
    )
    db.add(transaction)
    db.flush()  # Flush to get the transaction ID
    
    # For test mode (amount=0), use SetupIntent
    if amount_cents == 0:
        setup_intent = stripe.SetupIntent.create(
            metadata={
                "transaction_id": str(transaction.id),
                "payment_type": payment_type,
                "user_id": str(user_id)
            }
        )
        
        if details and isinstance(details, dict):
            for key, value in details.items():
                setup_intent.metadata[key] = str(value)
            setup_intent.save()
        
        return {
            "client_secret": setup_intent.client_secret,
            "transaction_id": transaction.id
        }
    
    # Create Stripe PaymentIntent for real payments
    payment_intent = stripe.PaymentIntent.create(
        amount=amount_cents,
        currency=settings.STRIPE_CURRENCY.lower(),
        metadata={
            "transaction_id": str(transaction.id),
            "payment_type": payment_type,
            "user_id": str(user_id)
        }
    )
    
    if details and isinstance(details, dict):
        for key, value in details.items():
            payment_intent.metadata[key] = str(value)
        payment_intent.save()
    
    return {
        "client_secret": payment_intent.client_secret,
        "transaction_id": transaction.id
    }


BOOST_DURATION_MAP = {1: 7, 2: 14, 3: 30}


def handle_subscription_payment(
    db: Session,
    transaction: PaymentTransaction,
    user_id: int,
    plan_type: str = "pro"
) -> Subscription:
    """
    Create a Subscription record after successful payment.
    
    Business logic:
    - start_date = today
    - end_date = today + 30 days
    - status = active
    """
    today = date.today()
    end_date = today + timedelta(days=30)
    
    subscription = Subscription(
        lawyer_id=user_id,
        plan_type=plan_type,
        start_date=today,
        end_date=end_date,
        status=SubscriptionStatus.active
    )
    db.add(subscription)
    db.flush()
    
    # Link transaction to subscription
    transaction.subscription_id = subscription.id
    transaction.status = PaymentStatus.success
    
    return subscription


def handle_boost_payment(
    db: Session,
    transaction: PaymentTransaction,
    user_id: int,
    boost_level: int,
    duration_days: int = None
) -> BoostPayment:
    """
    Create a BoostPayment record after successful payment.
    
    Business logic:
    - boost_level: Determines visibility priority (1-5), maps to duration
    - starts_at: Now
    - expires_at: Now + duration_days (based on boost_level if not provided)
    - amount: Already set in transaction
    """
    if duration_days is None:
        duration_days = BOOST_DURATION_MAP.get(boost_level, 7)
    now = datetime.utcnow()
    expires = now + timedelta(days=duration_days)
    
    boost = BoostPayment(
        lawyer_id=user_id,
        amount=transaction.amount,
        boost_level=boost_level,
        starts_at=now,
        expires_at=expires
    )
    db.add(boost)
    db.flush()
    
    # Link transaction to boost payment
    transaction.boost_payment_id = boost.id
    transaction.status = PaymentStatus.success
    
    return boost


def get_subscription_status(db: Session, lawyer_id: int) -> dict:
    """
    Get the current subscription status for a lawyer.
    Returns subscription details or None if no active subscription.
    """
    subscription = db.query(Subscription).filter(
        Subscription.lawyer_id == lawyer_id,
        Subscription.status == SubscriptionStatus.active
    ).first()
    
    if not subscription:
        return None
    
    return {
        "id": subscription.id,
        "plan_type": subscription.plan_type,
        "status": subscription.status.value,
        "start_date": subscription.start_date.isoformat(),
        "end_date": subscription.end_date.isoformat()
    }