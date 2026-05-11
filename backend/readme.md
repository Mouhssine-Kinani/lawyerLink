# LawyerLink Backend

## Prerequisites

- Python 3.10+
- MySQL database
- Node.js (optional, for Stripe CLI)

## Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Stripe CLI** (for webhook testing):
   - Download from: https://github.com/stripe/stripe-cli/releases
   - Or use: `npm install -g stripe`

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL=mysql+pymysql://root:<PASSWORD>@localhost:3306/lawyerlink_db
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GEMINI_API_KEY=your_gemini_api_key
MODEL=gemini
ALLOWED_ORIGINS=http://localhost:5173

# Stripe (REQUIRED)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=mad
STRIPE_TEST_MODE=true
```

## Running the Server

```bash
uvicorn app.main:app --reload
```

---

## Stripe Integration

### Overview

The payment system uses Stripe for handling subscriptions and profile boosts. It supports both test mode (0 MAD) and production mode.

### Payment Types

1. **Subscription** - Monthly subscription for lawyers (299 MAD)
2. **Boost** - Profile boost to increase visibility (49 MAD per level)

### Workflow

#### Production Flow (Real Payments)

1. Lawyer calls `POST /payments/subscription` or `POST /payments/boost`
2. Backend creates Stripe PaymentIntent/SetupIntent
3. Frontend uses `client_secret` to collect card via Stripe Elements
4. Stripe sends webhook to `/payments/webhook` on success
5. Backend creates subscription/boost record in database

#### Test Flow (0 MAD - STRIPE_TEST_MODE=true)

Since Stripe requires minimum amount (50 MAD for MAD), we use SetupIntent to save payment method without charging:

1. Lawyer calls `POST /payments/subscription`
2. Backend creates SetupIntent with metadata
3. Use Stripe CLI to trigger `setup_intent.succeeded` event
4. OR use test endpoint to simulate success

### Running Stripe CLI

For webhook testing, run in a separate terminal:

```bash
stripe listen --forward-to localhost:8000/payments/webhook
```

This will forward Stripe events to your local server.

To trigger test events:

```bash
stripe trigger setup_intent.succeeded
```

### Test Endpoints

Since Stripe CLI events may not match local transaction metadata correctly, use the test endpoint:

```bash
# 1. Create payment (saves transaction)
POST /payments/subscription?Authorization=<token>
# OR
POST /payments/boost?boost_level=2&Authorization=<token>

# 2. Get transaction ID
GET /payments/history?Authorization=<token>

# 3. Simulate success
POST /payments/test/simulate-success?transaction_id=<ID>&payment_type=subscription&Authorization=<token>
# OR
POST /payments/test/simulate-success?transaction_id=<ID>&payment_type=boost&Authorization=<token>

# 4. Verify
GET /payments/subscription/me?Authorization=<token>
# Check database
SELECT * FROM subscriptions;
SELECT * FROM boost_payments;
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| POST | /auth/logout | Logout |
| POST | /auth/forgot-password | Request password reset |
| GET | /auth/reset-password/verify | Verify reset token |
| POST | /auth/reset-password | Reset password |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/me | Get profile |
| POST | /users/me/image | Upload image |
| DELETE | /users/me/image | Delete image |
| DELETE | /users/me | Delete account |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /chat/session | Create session |
| POST | /chat/session/{id}/message | Send message |
| GET | /chat/session/{id}/history | Get history |
| GET | /chat/session/{id}/specialty | Get specialty |
| DELETE | /chat/session/{id} | Delete session |

### Recommendation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /recommendations/session/{id} | Session recommendations |
| GET | /recommendations/client | Client recommendations |

### Payment

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /payments/subscription | Purchase subscription |
| POST | /payments/boost?boost_level=1-5 | Purchase boost |
| GET | /payments/history | Payment history |
| GET | /payments/subscription/me | Active subscription |
| POST | /payments/subscription/renew | Renew subscription |
| POST | /payments/subscription/cancel | Cancel subscription |
| POST | /payments/test/simulate-success | Test simulation |
| POST | /payments/webhook | Stripe webhook |

---

## Database Migration

To add new columns (city, region):

```bash
python -m alembic upgrade head
```

Or manually:

```sql
ALTER TABLE users ADD COLUMN city VARCHAR(255), ADD COLUMN region VARCHAR(255);
```

---

## Testing with HTTPie

```bash
# Login
http POST localhost:8000/auth/login email=user@example.com password=password

# Get payment history (use token from login)
http GET localhost:8000/payments/history Authorization:"Bearer <TOKEN>"
```

---

## Notes

- All payment endpoints require JWT authentication (lawyer role)
- Test mode (`STRIPE_TEST_MODE=true`) uses 0 MAD
- The webhook handles both `payment_intent.succeeded` and `setup_intent.succeeded`
- For production, set `STRIPE_TEST_MODE=false` and use real Stripe keys