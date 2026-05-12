# LawyerLink - Frontend

## Payment Feature Setup

The payment system uses Stripe but defaults to **test/demo mode** (`STRIPE_TEST_MODE=true`) where no real money is charged. To get it working after a fresh clone:

### 1. Environment Variables
Ensure the backend `.env` file has these values (defaults are fine for test mode):
```env
STRIPE_SECRET_KEY=sk_test_...         # Can be any dummy value in test mode
STRIPE_WEBHOOK_SECRET=whsec_...       # Can be any dummy value in test mode
STRIPE_CURRENCY=mad
STRIPE_TEST_MODE=true                  # true = 0 MAD charges, no real Stripe calls
```

### 2. Run Database Migrations
The `subscriptions` table needs the `plan_type` column. From the `backend/` directory:
```bash
alembic upgrade head
```

### 3. User Flow (Test Mode)
1. **Register** as a lawyer at `/register`
2. **Log in** — the JWT token is stored in localStorage as `lawyerlink_token`
3. Navigate to **Subscription** at `/lawyer/subscription`
4. Click **Upgrade Now** on any plan (Pro recommended)
   - Backend creates a SetupIntent with amount=0
   - Frontend calls `simulate-success` to bypass Stripe
   - A `Subscription` record is created in the DB
5. After subscribing, the **Boost** cards unlock — choose a duration and click **Activate Boost**
6. Billing history appears at the bottom of the page

### 4. API Endpoints (all under `/payments`)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/subscription?plan=pro` | Create subscription intent |
| POST | `/boost?boost_level=1` | Create boost intent |
| GET | `/subscription/me` | Get current subscription |
| GET | `/history` | Get payment history |
| POST | `/subscription/cancel` | Cancel subscription |
| POST | `/test/simulate-success` | Simulate payment success (test mode only) |

### 5. Plans & Pricing
| Plan | Price | Boost Level | Duration | Boost Price |
|------|-------|-------------|----------|-------------|
| Basic | MAD 0/mo | Sprint (1) | 7 days | MAD 149 |
| Pro | MAD 299/mo | Catalyst (2) | 14 days | MAD 269 |
| Elite | MAD 499/mo | Authority (3) | 30 days | MAD 499 |

In test mode, all prices are treated as MAD 0.

### 6. Troubleshooting
- **Blank page**: Make sure `axios.js` is not empty (rewritten to use `fetch`)
- **401 Unauthorized**: Verify the token key in `payment.api.js` matches `AuthContext.jsx` — both use `lawyerlink_token`
- **500 / Unknown column**: Run `alembic upgrade head` to sync the database schema
- **CORS errors**: Backend must allow `http://localhost:5173` (set in `ALLOWED_ORIGINS`)
