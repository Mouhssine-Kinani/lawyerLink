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
) -> str:
    """
    Create a Stripe PaymentIntent and corresponding PaymentTransaction.
    
    For test mode (amount=0), we use SetupIntent instead of PaymentIntent.
    SetupIntent saves a payment method without charging - perfect for testing.
    
    The metadata acts as the bridge between Stripe events and our local database.
    When the webhook receives a payment_intent.succeeded event, it reads
    the transaction_id and payment_type from metadata to update the
    correct PaymentTransaction and create related records.
    
    Args:
        db: Database session
        user_id: The payer (user) ID
        amount: Payment amount in MAD (will be converted to cents for Stripe)
        payment_type: Either "subscription" or "boost"
        details: Additional details like boost_level for boost payments
    
    Returns:
        client_secret: The Stripe client secret for frontend integration
    """
    # Convert amount to cents (Stripe requires integer)
    # For test mode with 0 amount, we still create the intent but amount is 0
    amount_cents = int(float(amount) * 100) if amount > 0 else 0
    
    # Create PaymentTransaction first (with pending status)
    # This is the local record that the webhook will link to via metadata
    transaction = PaymentTransaction(
        payer_id=user_id,
        amount=amount,
        type=PaymentType(payment_type),
        status=PaymentStatus.pending
    )
    db.add(transaction)
    db.flush()  # Flush to get the transaction ID
    
    # For test mode (amount=0), use SetupIntent to save card without charging
    # This is perfect for PFA/testing where we don't want real charges
    if amount_cents == 0:
        setup_intent = stripe.SetupIntent.create(
            metadata={
                "transaction_id": str(transaction.id),
                "payment_type": payment_type,
                "user_id": str(user_id)
            }
        )
        
        # Add details to metadata if provided
        if details and isinstance(details, dict):
            for key, value in details.items():
                setup_intent.metadata[key] = str(value)
            setup_intent.save()
        
        return setup_intent.client_secret
    
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
    
    # If details provided (like boost_level), add to metadata
    if details and isinstance(details, dict):
        for key, value in details.items():
            payment_intent.metadata[key] = str(value)
        payment_intent.save()
    
    return payment_intent.client_secret


def handle_subscription_payment(
    db: Session,
    transaction: PaymentTransaction,
    user_id: int
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
    duration_days: int = 7
) -> BoostPayment:
    """
    Create a BoostPayment record after successful payment.
    
    Business logic:
    - boost_level: Determines visibility priority (1-5)
    - starts_at: Now
    - expires_at: Now + duration_days (default 7)
    - amount: Already set in transaction
    """
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
        "status": subscription.status.value,
        "start_date": subscription.start_date.isoformat(),
        "end_date": subscription.end_date.isoformat()
    }