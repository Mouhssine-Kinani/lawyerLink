# LawyerLink — Complete Platform Documentation

> **Generated:** Comprehensive technical documentation for AI-to-AI handoff
> **Project:** Legal consultation marketplace with AI-powered lawyer matching

---

## 1. EXECUTIVE SUMMARY

LawyerLink is a SaaS legal marketplace connecting Moroccan clients with lawyers. It features an AI Legal Assistant that analyzes client problems via natural language conversation, extracts their legal specialty and location, then recommends matching lawyers from the database. The platform supports three roles: **Client**, **Lawyer**, and **Admin**, each with dedicated dashboards and capabilities. Payments are handled via Stripe for monthly lawyer subscriptions ($299/mo) and profile boosts ($49-$245).

---

## 2. TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend Framework** | FastAPI (Python) | Latest |
| **Frontend** | React 19 + Vite 8 | ^19.2.4 / ^8.0.0 |
| **Language** | Python 3.x (backend), JavaScript JSX (frontend) | — |
| **Styling** | Tailwind CSS v4 | ^4.2.4 |
| **Database** | MySQL via SQLAlchemy ORM + PyMySQL | — |
| **Auth** | JWT (python-jose) + bcrypt (passlib) | — |
| **AI Provider** | Google Gemini (gemma-3-27b-it) OR Ollama (llama3.1:8b) | Configurable |
| **Payments** | Stripe (PaymentIntent, SetupIntent, Webhooks) | — |
| **Migrations** | Alembic | — |
| **Testing** | pytest | — |
| **Image Processing** | Pillow | — |
| **Dev Server** | uvicorn (backend) + Vite dev server (frontend) | — |
| **Monorepo Runner** | concurrently (root package.json) | ^8.2.2 |

---

## 3. PROJECT STRUCTURE (FULL TREE)

```
lawyerLink/
├── .gitignore
├── package.json                     # Monorepo root: runs backend + frontend concurrently
├── opencode.jsonc
├── readme.md                        # THIS FILE
├── test.json
├── backend_structure.txt
├── frontend_structure.txt
├── stitch-design/                   # Design mockups & PRD
│   ├── sign_up_login/               # Login/Register mockups
│   ├── notifications_hub/          # Notification center mockups
│   ├── messaging_panel/            # Messaging UI mockups
│   ├── lawyer_subscription/        # Lawyer subscription page mockups
│   ├── lawyer_profile/             # Lawyer profile page mockups
│   ├── lawyer_directory_2/         # Lawyer directory mockups
│   ├── lawyer_dashboard/           # Lawyer dashboard mockups
│   ├── lawyerlink_prd.html         # Product Requirements Document
│   ├── landing_page_2/             # Landing page mockups
│   ├── juris_slate/                # Design system specification ("The Digital Jurist")
│   │   └── DESIGN.md               # Full design system: colors, typography, spacing, glassmorphism
│   ├── ai_legal_assistant_2/       # AI chat assistant mockups
│   ├── client_dashboard_2/         # Client dashboard mockups
│   ├── admin_dashboard/            # Admin dashboard mockups
│   ├── book_consultation/          # Booking flow mockups
│   └── boost_visibility/           # Boost visibility mockups
│
├── backend/
│   ├── .env / .env.example
│   ├── requirements.txt
│   ├── alembic.ini / alembic/       # Database migration configs
│   ├── features.json                # Feature tracking (done/todo by route)
│   ├── uploads/                     # Uploaded profile pictures
│   │   └── profiles/
│   │       ├── clients/
│   │       └── lawyers/
│   ├── tests/
│   ├── venv/                        # Python virtual environment
│   └── app/
│       ├── __init__.py
│       ├── main.py                  # FastAPI entry point, CORS, router registration
│       ├── role_privileges.json     # Complete role-privilege matrix (39 endpoints)
│       ├── core/
│       │   ├── __init__.py
│       │   ├── config.py            # Settings from .env (DB, JWT, Stripe, AI, CORS)
│       │   ├── database.py          # SQLAlchemy engine, SessionLocal, Base, get_db()
│       │   ├── security.py          # hash_password, verify_password, create_access_token, decode_token
│       │   ├── dependencies.py      # get_current_user, require_role(role), get_client_session
│       │   ├── upload.py            # save_profile_picture (resize 400x400, JPEG), delete_profile_picture
│       │   └── blacklist.py         # TokenBlacklist model & methods (extract_jti, is_blacklisted, blacklist)
│       ├── auth/
│       │   ├── __init__.py
│       │   ├── router.py            # register, login, logout, forgot-password, reset-password
│       │   ├── schema.py            # Pydantic: RegisterRequest, LoginRequest, TokenResponse, etc.
│       │   └── password_reset.py    # PasswordResetToken model (SHA256 hash, 30min expiry, single-use)
│       ├── user/
│       │   ├── __init__.py
│       │   ├── model.py             # User + Client models (SQLAlchemy)
│       │   ├── router.py            # /users/me (GET, PATCH, image upload/delete, DELETE account cascade)
│       │   └── schema.py            # Pydantic: UserResponse, UserFullResponse, ClientResponse, etc.
│       ├── lawyer/
│       │   ├── __init__.py
│       │   ├── model.py             # Lawyer model (SQLAlchemy)
│       │   ├── router.py            # PATCH /lawyer/me, GET reviews/reservations/payments
│       │   └── schema.py            # Pydantic: LawyerUpdate, LawyerResponse
│       ├── chat/
│       │   ├── __init__.py
│       │   ├── model.py             # ChatSession, ChatMessage (SQLAlchemy)
│       │   ├── router.py            # CRUD chat sessions + messages + admin check-subscriptions
│       │   ├── schema.py            # Pydantic: MessageCreate, ChatResponse, LawyerInfo, etc.
│       │   ├── config.py            # SYSTEM_PROMPT (5-step flow), MODEL, MAX_HISTORY_MESSAGES, AI_PROVIDER
│       │   ├── cache.py             # In-memory cache for specialties & cities (TTL 10 min)
│       │   ├── ai_service.py        # AI provider switchboard (gemini vs ollama)
│       │   ├── service.py           # Ollama integration implementation
│       │   └── gemini_service.py    # Google Gemini integration implementation (active)
│       ├── reservation/
│       │   ├── __init__.py
│       │   ├── model.py             # Reservation model + ReservationStatus enum
│       │   ├── router.py            # CRUD + status transitions + role-based permissions
│       │   └── schema.py            # Pydantic: ReservationCreate, ReservationUpdate, etc.
│       ├── review/
│       │   ├── __init__.py
│       │   ├── model.py             # Review model (SQLAlchemy)
│       │   ├── router.py            # CRUD + 7-day edit window + lawyer rating recalculation
│       │   └── schema.py            # Pydantic: ReviewCreate, ReviewUpdate, ReviewResponse
│       ├── recommendation/
│       │   ├── __init__.py
│       │   ├── model.py             # RecommendationLog model (SQLAlchemy)
│       │   ├── router.py            # Save & fetch recommendations by session/client
│       │   └── schema.py            # Pydantic: RecommendationLogResponse
│       ├── payment/
│       │   ├── __init__.py
│       │   ├── model.py             # Subscription, BoostPayment, PaymentTransaction (SQLAlchemy)
│       │   ├── router.py            # Stripe intents, webhook, cancel/renew, test simulator
│       │   ├── schema.py            # Pydantic models
│       │   └── service.py           # create_stripe_intent, handle_subscription_payment, handle_boost_payment
│       └── admin/
│           ├── __init__.py
│           ├── router.py            # Dashboard stats, user/lawyer/reservation CRUD management
│           └── schema.py            # Pydantic: DashboardStats, AdminUserResponse, etc.
│
└── frontend/
    ├── .env.example
    ├── index.html
    ├── vite.config.js                # Vite + React + Tailwind v4 plugin
    ├── eslint.config.js
    ├── package.json
    └── src/
        ├── main.jsx                  # React entry point
        ├── App.jsx                   # All routes defined with guards
        ├── index.css                 # Tailwind v4 + custom theme (colors, glass, gradients)
        ├── App.css
        ├── assets/
        ├── api/
        │   ├── axios.js              # (empty stub)
        │   ├── auth.api.js           # register, login, logout, forgot/reset password (FETCH-based)
        │   ├── chat.api.js           # (empty stub)
        │   ├── lawyer.api.js         # (empty stub)
        │   ├── payment.api.js        # (empty stub)
        │   ├── reservation.api.js    # (empty stub)
        │   └── review.api.js         # (empty stub)
        ├── context/
        │   └── AuthContext.jsx        # React context: login/logout/register with localStorage + JWT decode
        ├── hooks/
        │   ├── useAuth.js            # Wrapper exporting AuthContext
        │   ├── useChat.js            # (empty stub)
        │   └── useLawyers.js         # (empty stub)
        ├── store/
        │   ├── auth.store.js         # (empty stub)
        │   ├── chat.store.js         # (empty stub)
        │   └── reservation.store.js  # (empty stub)
        ├── utils/
        │   ├── constants.js          # (empty stub)
        │   └── formatDate.js         # (empty stub)
        ├── components/
        │   ├── chat/
        │   │   ├── ChatInput.jsx     # (empty stub)
        │   │   ├── ChatMessage.jsx   # (empty stub)
        │   │   └── ChatWindow.jsx    # (empty stub)
        │   ├── common/
        │   │   ├── LoadingSpinner.jsx
        │   │   ├── Modal.jsx
        │   │   ├── Pagination.jsx
        │   │   ├── PrivateRoute.jsx   # Redirects to /login if not authenticated
        │   │   └── RoleRoute.jsx      # Redirects to / if role doesn't match
        │   ├── lawyer/
        │   │   ├── LawyerCard.jsx
        │   │   ├── LawyerFilter.jsx
        │   │   └── StarRating.jsx
        │   ├── layout/
        │   │   ├── DashboardLayout.jsx  # Sidebar + content + footer
        │   │   ├── Sidebar.jsx          # Role-based navigation items
        │   │   ├── Navbar.jsx           # Public nav with auth-aware links
        │   │   ├── Footer.jsx           # Site footer
        │   │   └── PublicLayout.jsx     # Navbar + content + footer wrapper
        │   ├── payment/
        │   │   └── PaymentForm.jsx
        │   └── reservation/
        │       ├── ReservationCard.jsx
        │       └── StatusBadge.jsx
        └── pages/
            ├── LandingPage.jsx          # FULL implementation (hero, search, features, attorneys)
            ├── auth/
            │   ├── LoginPage.jsx         # SKELETON
            │   └── RegisterPage.jsx      # SKELETON
            ├── client/
            │   ├── ChatPage.jsx          # SKELETON (<h1>Chat</h1>)
            │   ├── LawyerListPage.jsx    # FULL implementation (filters sidebar + lawyer grid)
            │   ├── LawyerProfilePage.jsx # FULL implementation (profile + reviews + booking)
            │   ├── MyReservationsPage.jsx# SKELETON
            │   ├── RecommendationsPage.jsx# SKELETON
            │   ├── ReservationPage.jsx   # SKELETON
            │   └── ReviewPage.jsx        # SKELETON
            ├── lawyer/
            │   ├── BoostPage.jsx         # SKELETON
            │   ├── DashboardPage.jsx     # SKELETON
            │   ├── MyReservationsPage.jsx# SKELETON
            │   ├── ProfileEditPage.jsx   # SKELETON
            │   └── SubscriptionPage.jsx  # SKELETON
            └── admin/
                ├── AdminDashboard.jsx    # SKELETON
                ├── LawyerApprovalPage.jsx# SKELETON
                └── UsersPage.jsx         # SKELETON
```

---

## 4. DATABASE SCHEMA (MySQL via SQLAlchemy)

The database is named `lawyerlink_db`. All tables are created automatically via `Base.metadata.create_all()` on startup (development mode). In production, Alembic migrations should be used.

### 4.1 `users` — Core user table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PK, auto-increment | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash |
| role | ENUM('admin','client','lawyer') | NOT NULL | |
| city | VARCHAR(255) | NULLABLE | |
| region | VARCHAR(255) | NULLABLE | |
| image_url | VARCHAR(500) | NULLABLE | Path to profile pic |
| created_at | DATETIME | NOT NULL | server_default=now() |

Relationships: `client_profile` (one-to-one with clients), `lawyer_profile` (one-to-one with lawyers)

### 4.2 `clients` — Client-specific profile

| Column | Type | Constraints |
|--------|------|-------------|
| user_id | BIGINT | PK, FK → users.id |
| first_name | VARCHAR(255) | NOT NULL |
| last_name | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(50) | NOT NULL |

Relationships: `user`, `chat_sessions`, `recommendations`, `reservations`, `reviews`

### 4.3 `lawyers` — Lawyer-specific profile

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| user_id | BIGINT | PK, FK → users.id | |
| first_name | VARCHAR(255) | NULLABLE | |
| last_name | VARCHAR(255) | NULLABLE | |
| firm | VARCHAR(255) | NULLABLE | Law firm name |
| license_number | VARCHAR(100) | NULLABLE | Professional license |
| specialties | TEXT | NULLABLE | JSON array or comma-separated |
| languages | VARCHAR(255) | NULLABLE | e.g., "Arabic, French, English" |
| hourly_rate | DECIMAL | NULLABLE | |
| rating_avg | DECIMAL | NULLABLE | Auto-calculated from reviews |
| rating_count | INTEGER | NOT NULL, default(0) | |
| city | VARCHAR(255) | NULLABLE | |
| region | VARCHAR(255) | NULLABLE | |
| is_active | BOOLEAN | NOT NULL, default(TRUE) | Admin toggle |

Relationships: `user`, `recommendations`, `reservations`, `reviews`, `subscriptions`, `boost_payments`

### 4.4 `chat_sessions` — AI chat sessions

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| client_id | BIGINT | FK → clients.user_id, NOT NULL |
| created_at | DATETIME | server_default=now() |

Relationships: `client`, `messages` (cascade delete), `recommendations`

### 4.5 `chat_messages` — Messages within chat sessions

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| session_id | BIGINT | FK → chat_sessions.id, NOT NULL |
| sender | ENUM('client','ai') | NOT NULL |
| content | TEXT | NOT NULL |
| created_at | DATETIME | server_default=now() |

### 4.6 `reservations` — Client-lawyer bookings

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PK, auto-increment | |
| client_id | BIGINT | FK → clients.user_id, NOT NULL | |
| lawyer_id | BIGINT | FK → lawyers.user_id, NOT NULL | |
| reservation_date | DATETIME | NOT NULL | Date/time of appointment |
| status | ENUM('pending','accepted','rejected','completed','cancelled') | default('pending') | See lifecycle below |
| notes | TEXT | NULLABLE | |
| created_at | DATETIME | server_default=now() | |

**Status Lifecycle:**
- pending → accepted → completed (forward flow)
- pending → rejected (lawyer declines)
- pending → cancelled (client cancels)
- accepted → completed (lawyer marks done)
- accepted → cancelled (lawyer cancels)

### 4.7 `reviews` — Client reviews for lawyers

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| client_id | BIGINT | FK → clients.user_id, NOT NULL |
| lawyer_id | BIGINT | FK → lawyers.user_id, NOT NULL |
| reservation_id | BIGINT | FK → reservations.id, NULLABLE |
| rating | INTEGER | NOT NULL (1-5) |
| comment | TEXT | NULLABLE |
| created_at | DATETIME | server_default=now() |

### 4.8 `recommendation_logs` — AI lawyer recommendation history

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| client_id | BIGINT | FK → clients.user_id, NOT NULL |
| session_id | BIGINT | FK → chat_sessions.id, NOT NULL |
| lawyer_id | BIGINT | FK → lawyers.user_id, NOT NULL |
| score | DECIMAL | NULLABLE |
| rank | INTEGER | NULLABLE |
| created_at | DATETIME | server_default=now() |

### 4.9 `subscriptions` — Lawyer monthly subscriptions

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PK, auto-increment | |
| lawyer_id | BIGINT | FK → lawyers.user_id, NOT NULL | |
| start_date | DATE | NOT NULL | Today |
| end_date | DATE | NOT NULL | Today + 30 days |
| status | ENUM('active','expired','cancelled') | default('active') | |

### 4.10 `boost_payments` — Profile boost purchases

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| lawyer_id | BIGINT | FK → lawyers.user_id, NOT NULL |
| amount | DECIMAL | NOT NULL |
| boost_level | INTEGER | NOT NULL (1-5) |
| starts_at | DATETIME | NOT NULL |
| expires_at | DATETIME | NOT NULL |

### 4.11 `payment_transactions` — All payment records

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| payer_id | BIGINT | FK → users.id, NOT NULL |
| subscription_id | BIGINT | FK → subscriptions.id, NULLABLE |
| boost_payment_id | BIGINT | FK → boost_payments.id, NULLABLE |
| amount | DECIMAL | NOT NULL |
| type | ENUM('subscription','boost') | NOT NULL |
| status | ENUM('pending','success','failed') | default('pending') |
| created_at | DATETIME | server_default=now() |

### 4.12 `token_blacklist` — Revoked JWT tokens

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| jti | VARCHAR(255) | UNIQUE, NOT NULL (JWT token ID) |
| expires_at | DATETIME | NOT NULL |
| created_at | DATETIME | server_default=now() |

### 4.13 `password_reset_tokens` — Secure password reset

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| user_id | BIGINT | FK → users.id, NOT NULL |
| token_hash | VARCHAR(255) | UNIQUE, NOT NULL (SHA256) |
| expires_at | DATETIME | NOT NULL (30 min) |
| used | BIGINT | default(0) |
| created_at | DATETIME | server_default=now() |

---

## 5. ALL PAGES & ROUTES (Frontend)

### 5.1 Public Pages (no authentication required)

| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/` | LandingPage | **DONE** | Hero with AI-powered search box, feature cards, "How It Works" section, featured attorneys grid with ratings, testimonials carousel, trust badges, FAQ accordion, footer CTA |
| `/login` | LoginPage | SKELETON | Login form (not yet built) |
| `/register` | RegisterPage | SKELETON | Registration form (not yet built) |
| `/client/lawyers` | LawyerListPage | **DONE** | Full lawyer directory with sidebar filters (specialties, cities, languages, rating, hourly rate), grid of LawyerCards with profile images, ratings, bookmarks |
| `/client/lawyers/:id` | LawyerProfilePage | **DONE** | Full lawyer profile: cover image, stats bar (experience, cases, rating), bio, specialties tags, languages, reviews list, "Book Consultation" CTA |

### 5.2 Client Pages (role = client)

| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/client/chat` | ChatPage | SKELETON | `<h1>Chat</h1>` only |
| `/client/reservations` | MyReservationsPage | SKELETON | Client's reservation list |
| `/client/reservations/new` | ReservationPage | SKELETON | Booking form |
| `/client/recommendations` | RecommendationsPage | SKELETON | AI recommendation history |
| `/client/reviews` | ReviewPage | SKELETON | Client's own reviews |

### 5.3 Lawyer Pages (role = lawyer)

| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/lawyer/dashboard` | DashboardPage | SKELETON | Lawyer stats & analytics |
| `/lawyer/reservations` | MyReservationsPage | SKELETON | Manage incoming bookings |
| `/lawyer/profile` | ProfileEditPage | SKELETON | Edit professional profile |
| `/lawyer/subscription` | SubscriptionPage | SKELETON | Manage monthly subscription |
| `/lawyer/boost` | BoostPage | SKELETON | Purchase visibility boost |

### 5.4 Admin Pages (role = admin)

| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/admin/dashboard` | AdminDashboard | SKELETON | Platform-wide analytics |
| `/admin/users` | UsersPage | SKELETON | User management |
| `/admin/lawyers/approval` | LawyerApprovalPage | SKELETON | Lawyer activation/deactivation |

---

## 6. ALL API ENDPOINTS (39 Total)

### 6.1 Authentication — `/auth` (6 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | Public | Register as client or lawyer (email, password, role, first_name, last_name, phone) |
| `POST` | `/auth/login` | Public | Login, returns JWT access_token (60min expiry) |
| `POST` | `/auth/logout` | Auth'd | Blacklists current JWT by jti |
| `POST` | `/auth/forgot-password` | Public | Generates SHA256-hashed reset token, returns raw token in dev |
| `GET` | `/auth/reset-password/verify` | Public | Verify if a reset token is still valid |
| `POST` | `/auth/reset-password` | Public | Reset password with valid token (single-use) |

### 6.2 User Profile — `/users` (5 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users/me` | Auth'd | Full profile including client/lawyer-specific fields |
| `PATCH` | `/users/me` | Auth'd | Update city/region |
| `POST` | `/users/me/image` | Auth'd | Upload profile picture (validates type, size, resizes to 400x400 JPEG) |
| `DELETE` | `/users/me/image` | Auth'd | Delete profile picture |
| `DELETE` | `/users/me` | Auth'd | Permanent account deletion with full cascade (sessions, messages, reviews, reservations, payments, tokens) |

### 6.3 AI Chat — `/chat` (6 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/chat/session` | Client | Create new AI chat session |
| `POST` | `/chat/session/{id}/message` | Client | Send message → AI response + optional lawyer recommendations |
| `GET` | `/chat/session/{id}/history` | Client | Full chat message history |
| `GET` | `/chat/session/{id}/specialty` | Client | Extract legal specialty from conversation |
| `DELETE` | `/chat/session/{id}` | Client | Delete session + all messages |
| `POST` | `/chat/admin/check-subscriptions` | Admin | Check & expire overdue subscriptions |

### 6.4 Lawyer Profile — `/lawyer` (5 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PATCH` | `/lawyer/me` | Lawyer | Update profile (name, firm, license, specialties, languages, rate, city, region) |
| `GET` | `/lawyer/me/reviews` | Lawyer | Get all reviews received |
| `GET` | `/lawyer/me/reservations` | Lawyer | Get reservations with filters (?status, ?date_from, ?date_to, ?limit) |
| `PATCH` | `/lawyer/me/reservations/{id}` | Lawyer | Accept/reject/complete/cancel + reschedule with conflict check |
| `GET` | `/lawyer/me/payments/history` | Lawyer | Payment history with date & type filters |

### 6.5 Reservations — `/reservations` (4 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/reservations/` | Auth'd | Create reservation (validates lawyer active, subscription active, timeslot free) |
| `GET` | `/reservations/` | Auth'd | List reservations (role-filtered: clients see theirs, lawyers see theirs) |
| `GET` | `/reservations/{id}` | Auth'd | Get single reservation (role-permission checked) |
| `PATCH` | `/reservations/{id}` | Auth'd | Update status/date/notes (role-gated transitions) |
| `DELETE` | `/reservations/{id}` | Client | Cancel pending reservation only |

### 6.6 Reviews — `/reviews` (7 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/reviews/` | Client | Create review (completed reservations only, auto-calculates lawyer rating) |
| `GET` | `/reviews/lawyer/{id}` | Public | All reviews for a lawyer (paginated) |
| `GET` | `/reviews/me` | Client | Client's own reviews |
| `GET` | `/reviews/reservation/{id}` | Auth'd | Review by reservation ID |
| `PATCH` | `/reviews/{id}` | Client | Update review (within 7-day window, recalculates rating) |
| `DELETE` | `/reviews/{id}` | Client | Delete review (within 7-day window, recalculates rating) |
| `GET` | `/reviews/admin/all` | Admin | All platform reviews for moderation |

### 6.7 Recommendations — `/recommendations` (2 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/recommendations/session/{id}` | Public | Get AI recommendations for a session |
| `GET` | `/recommendations/client` | Client | Get all recommendations for current client |

### 6.8 Payments — `/payments` (8 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/payments/subscription` | Lawyer | Create Stripe intent ($299 or $0 test mode) |
| `POST` | `/payments/boost` | Lawyer | Create Stripe intent ($49 × boost_level 1-5, requires active subscription) |
| `GET` | `/payments/history` | Lawyer | Transaction history |
| `GET` | `/payments/subscription/me` | Lawyer | Current subscription status |
| `POST` | `/payments/subscription/renew` | Lawyer | Renew subscription |
| `POST` | `/payments/subscription/cancel` | Lawyer | Cancel active subscription |
| `POST` | `/payments/test/simulate-success` | Public | Test: simulate successful Stripe payment |
| `POST` | `/payments/webhook` | Public | Stripe webhook handler (payment_intent.succeeded + setup_intent.succeeded) |

### 6.9 Admin — `/admin` (6 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/dashboard` | Admin | Platform stats (users, clients, lawyers, reservations, reviews, avg rating) |
| `GET` | `/admin/users` | Admin | List users (filter by role/?status) |
| `GET` | `/admin/users/{id}` | Admin | Get user by ID |
| `POST` | `/admin/users` | Admin | Create new user (client or lawyer) |
| `PATCH` | `/admin/users/{id}` | Admin | Update user email/city/region |
| `DELETE` | `/admin/users/{id}` | Admin | Delete user (permanent cascade, with self-deletion protection) |
| `GET` | `/admin/reservations` | Admin | All reservations (filter by status) |
| `GET` | `/admin/lawyers` | Admin | All lawyers with subscription status |
| `PATCH` | `/admin/lawyers/{id}/toggle-active` | Admin | Activate/deactivate lawyer |

---

## 7. AUTHENTICATION & AUTHORIZATION SYSTEM

### 7.1 JWT Token Flow

1. **Login**: User provides email + password → backend verifies bcrypt hash → creates JWT with payload:
   ```json
   { "sub": "user_id", "role": "client|lawyer|admin", "jti": "uuid", "exp": timestamp }
   ```
2. **Token expiry**: Configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` in .env (default: 60 minutes)
3. **Token decoding**: `python-jose` with HS256 algorithm, `SECRET_KEY` from .env
4. **Frontend storage**: Token stored in `localStorage` under key `lawyerlink_token`
5. **Frontend user**: Role decoded client-side via `atob(token.split(".")[1])`, stored in `localStorage` under `lawyerlink_user`

### 7.2 Logout (Token Blacklist)

- On logout, the JWT's `jti` is stored in the `token_blacklist` table
- Every authenticated request checks: is the JWT's `jti` in the blacklist?
- Blacklist cleanup: expired blacklist entries automatically cleaned

### 7.3 Role-Based Access Control

The `require_role(role)` dependency factory returns a FastAPI dependency that:
- Calls `get_current_user` to decode token, check blacklist, fetch User from DB
- Checks `user.role.value == required_role`
- Returns 403 if mismatch

Roles: `public` (unauthenticated), `client`, `lawyer`, `admin`
Role hierarchy: `admin` inherits `authenticated_any`, which inherits `public`

### 7.4 Password Reset

- **Token generation**: `secrets.token_bytes(32)` → base64url encoded (raw token to user) → SHA256 hashed (stored in DB)
- **Expiry**: 30 minutes from creation
- **Single-use**: Marked `used = 1` after successful reset
- **Dev mode**: In development, the raw token and reset URL are returned in the API response (in production, an email would be sent)

---

## 8. AI CHAT SYSTEM (DETAILED)

### 8.1 Architecture

Two AI providers are supported, toggled by `AI_PROVIDER` in `chat/config.py`:

| Provider | Model | Package | Status |
|----------|-------|---------|--------|
| Google Gemini | `gemma-3-27b-it` | `google-genai` | **Active** (default) |
| Ollama (local) | `llama3.1:8b` | `ollama` Python lib | Available, not default |

### 8.2 System Prompt — 5-Step Conversation Flow

The AI assistant is strictly constrained to follow these steps in order:

1. **STEP 0 — Greeting**: On very first message only, warm greeting identifying as LawyerLink Assistant
2. **STEP 1 — Acknowledge + Ask City**: Briefly acknowledge client's problem, ask "Which city are you in?"
3. **STEP 2 — Ask Specialty**: Ask clarifying question to determine legal specialty (family law, criminal, business, etc.)
4. **STEP 3 — Ask Language**: "Do you have a preferred language?" (optional — client can skip)
5. **STEP 4 — Ask Budget**: "Do you have a budget for hourly rate?" (optional — client can skip)
6. **STEP 5 — Confirm & Search**: When client agrees → output `[SEARCH_LAWYERS:specialty:city]` tag

### 8.3 Multi-Language Support

- **Auto-detection** from first 5 client messages using:
  - Arabic: Unicode range `[\u0600-\u06FF]`
  - French: Accented characters + common French words (je, avocat, divorce, etc.)
  - English: Default fallback
- Once detected, language is frozen for the entire session

### 8.4 Lawyer Search & Recommendation Pipeline

When the AI outputs `[SEARCH_LAWYERS:specialty:city]`:

1. Backend regex-parses the tag to extract specialty and city
2. `extract_legal_specialty()`: Calls AI to pick specialty from cached list of all available lawyer specialties
3. `extract_location()`: Matches city from client messages against cached city list
4. `fetch_top_lawyers()`: Queries database for lawyers who are:
   - Active (`is_active = True`)
   - Have active subscription (not expired/cancelled)
   - Matches city (if provided)
   - Matches specialty (if provided, fuzzy via `ilike`)
   - Ordered by boost priority first, then by default order
5. `get_top3_from_ai()`: Sends candidate lawyers to AI with case summary, AI picks top 3
6. **Boost priority**: Any boosted lawyers not in top 3 are appended after (up to 2 extra)
7. Results are saved to `recommendation_logs` table

### 8.5 In-Memory Cache

- Specialties and cities cached in-memory (10-minute TTL)
- Refreshed on cache miss by querying the database
- Functions: `get_cached_specialties()`, `get_cached_cities()`, `invalidate_specialties_cache()`, `invalidate_cities_cache()`

---

## 9. PAYMENT SYSTEM (DETAILED)

### 9.1 Stripe Integration

- **Test mode** (`STRIPE_TEST_MODE=true`): Uses SetupIntent ($0), saves card without charging
- **Production mode** (`STRIPE_TEST_MODE=false`): Uses PaymentIntent with real charges
- **Currency**: MAD (Moroccan Dirham), configurable

### 9.2 Lawyer Monthly Subscription

- **Price**: $299/month (or $0 in test mode)
- **Duration**: 30 days from purchase
- **Statuses**: `active` → `expired` (auto after end_date) or `cancelled` (lawyer-initiated)
- **Required for**: Creating reservations (lawyer must have active subscription)
- **Required for**: Purchasing boosts (must have active subscription first)
- **Admin endpoint**: `/chat/admin/check-subscriptions` to batch-expire overdue subscriptions

### 9.3 Profile Boost

- **Price**: $49 × boost_level (1-5)
- **Duration**: 7 days
- **Effect**: Boosted lawyers appear first in AI recommendations
- **Requirement**: Active subscription required to purchase boost
- **Stacking**: Multiple boosts can coexist (different start/end dates)

### 9.4 Payment Flow

1. Lawyer initiates payment (subscription or boost)
2. Backend creates `PaymentTransaction` (status: `pending`)
3. Backend creates Stripe PaymentIntent/SetupIntent with metadata:
   - `transaction_id`, `payment_type`, `user_id`, (optional: `boost_level`)
4. Frontend completes payment with Stripe.js
5. Stripe sends webhook to `/payments/webhook`
6. Webhook handler:
   - Matches `payment_intent.succeeded` or `setup_intent.succeeded`
   - Reads transaction_id from metadata
   - Updates PaymentTransaction status to `success`
   - Creates Subscription or BoostPayment record
   - Links back to PaymentTransaction

---

## 10. FRONTEND COMPONENT DETAILS

### 10.1 Layout Components

| Component | Location | Description |
|-----------|----------|-------------|
| `Navbar.jsx` | `/components/layout/` | Sticky top nav. Shows Logo + Find Lawyers + AI Assistant links. Auth-aware: shows Login/SignUp for guests, email + Logout button + search bar for authenticated users |
| `Footer.jsx` | `/components/layout/` | Site footer |
| `Sidebar.jsx` | `/components/layout/` | Left sidebar with role-based navigation: Admin (Dashboard, Users, Lawyer Approval, Reservations), Lawyer (Dashboard, Reservations, Profile, Subscription, Boost), Client (Find Lawyers, AI Assistant, Reservations, Reviews). Includes user avatar/email section |
| `PublicLayout.jsx` | `/components/layout/` | Navbar + content + Footer wrapper for public pages |
| `DashboardLayout.jsx` | `/components/layout/` | Sidebar + content area + Footer for authenticated pages |

### 10.2 Common Components

| Component | Description |
|-----------|-------------|
| `PrivateRoute.jsx` | Checks `isAuthenticated` from AuthContext; redirects to `/login` if false |
| `RoleRoute.jsx` | Wraps PrivateRoute; checks `user.role === requiredRole`; redirects to `/` if mismatch |
| `LoadingSpinner.jsx` | Reusable loading indicator |
| `Modal.jsx` | Reusable modal dialog |
| `Pagination.jsx` | Reusable pagination control |

### 10.3 Lawyer Components

| Component | Description |
|-----------|-------------|
| `LawyerCard.jsx` | Card displaying lawyer avatar, name, specialty, rating, location, book action |
| `LawyerFilter.jsx` | Sidebar filter panel (specialty, city, language, rating, hourly rate) |
| `StarRating.jsx` | Star rating display (1-5) |

### 10.4 Payment & Reservation Components

| Component | Description |
|-----------|-------------|
| `PaymentForm.jsx` | Stripe payment form |
| `ReservationCard.jsx` | Reservation summary card |
| `StatusBadge.jsx` | Reservation status badge (pending/accepted/rejected/completed/cancelled) |

### 10.5 Design System (Tailwind v4 Theme)

Defined in `index.css`:

- **Color palette**: Material Design 3-inspired
  - Primary: `#00236f` (deep authority blue)
  - Primary Container: `#1e3a8a`
  - Secondary: `#0058be` (action blue)
  - Tertiary/Accent: `#f59e0b` (gold, mapped)
  - Surfaces: `#f8f9ff` (background), white (surface-container-lowest)
- **Typography**: Inter font family (headline, body, label)
- **Custom utilities**:
  - `glass-effect`: `rgba(255,255,255,0.8)` + `backdrop-filter: blur(20px)`
  - `glass-sidebar`: Same glassmorphism for sidebars
  - `gradient-cta`, `primary-gradient`, `btn-gradient`: `linear-gradient(135deg, #00236f, #1e3a8a)`
  - Material Symbols Outlined for icons
- **Body**: background `#f8f9ff` with subtle radial gradients

---

## 11. CONFIGURATION FILES

### 11.1 Backend `.env`

```env
DATABASE_URL=mysql+pymysql://root:<PASSWORD>@localhost:3306/lawyerlink_db
SECRET_KEY=<random_key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GEMINI_API_KEY=<your_key>         # Required for Gemini AI
MODEL=gemini                       # AI provider model name
ALLOWED_ORIGINS=http://localhost:5173
STRIPE_SECRET_KEY=<stripe_key>
STRIPE_WEBHOOK_SECRET=<webhook_secret>
STRIPE_CURRENCY=mad
STRIPE_TEST_MODE=true              # true = $0 test payments
```

### 11.2 Frontend `.env`

```env
VITE_API_URL=http://localhost:8000
```

### 11.3 AI Chat Config (`chat/config.py`)

```python
AI_PROVIDER = "gemini"  # "ollama" or "gemini"
MODEL = "llama3.1:8b"   # default, overridden if using Gemini
MAX_HISTORY_MESSAGES = 20
```

### 11.4 Root package.json (Monorepo Scripts)

```json
{
  "scripts": {
    "frontend": "cd frontend && npm run dev",
    "backend": "cd backend && uvicorn app.main:app --reload",
    "dev": "concurrently -n BACKEND,FRONTEND \"npm run backend\" \"npm run frontend\""
  }
}
```

---

## 12. FEATURE STATUS SUMMARY

Based on `backend/features.json` and code analysis:

### ✅ COMPLETED (Backend - All endpoints functional)

| Feature | Status | Endpoints |
|---------|--------|-----------|
| Authentication | **Done** | 6 endpoints (register, login, logout, forgot/reset password) |
| User Profile | **Done** | 5 endpoints (profile CRUD, image upload/delete, account deletion) |
| AI Chat | **Done** | 6 endpoints (sessions, messages, history, specialty extraction) |
| Lawyer Profile | **Done** | 5 endpoints (update profile, reviews, reservations, payment history) |
| Recommendations | **Done** | 2 endpoints (by session, by client) |
| Reservations | **Done** | 5 endpoints (CRUD + status transitions) |
| Reviews | **Done** | 7 endpoints (CRUD + 7-day edit window + rating recalculation) |
| Payments | **Done** | 8 endpoints (subscription, boost, webhook, cancel, renew, history) |
| Admin | **Done** | 9 endpoints (dashboard stats, users CRUD, lawyers CRUD, reservations oversight) |

### ⚠️ FRONTEND STATUS

| Page | Status | Notes |
|------|--------|-------|
| LandingPage | **DONE** | Fully implemented with hero, search, features, attorneys, testimonials |
| LawyerListPage | **DONE** | Full filter sidebar + lawyer grid |
| LawyerProfilePage | **DONE** | Full profile with reviews, stats, booking CTA |
| LawerCard component | **DONE** | Used in LawyerListPage |
| All other components | **DONE** | Layout (Navbar, Sidebar, Footer), guards (PrivateRoute, RoleRoute), common (Modal, Pagination, LoadingSpinner, StarRating, StatusBadge, PaymentForm) |
| ChatPage | **SKELETON** | Just `<h1>Chat</h1>` |
| LoginPage | **SKELETON** | Not implemented |
| RegisterPage | **SKELETON** | Not implemented |
| All other client/lawyer/admin pages | **SKELETON** | Placeholder components only |

### 📋 FRONTEND API LAYER

| File | Status |
|------|--------|
| `auth.api.js` | **DONE** — register, login, logout, forgotPassword, verifyResetToken, resetPassword |
| `chat.api.js` | EMPTY STUB |
| `lawyer.api.js` | EMPTY STUB |
| `payment.api.js` | EMPTY STUB |
| `reservation.api.js` | EMPTY STUB |
| `review.api.js` | EMPTY STUB |

### 📋 FRONTEND HOOKS & STORES

| File | Status |
|------|--------|
| `AuthContext.jsx` | **DONE** — Full auth context (login, register, logout, JWT decode, localStorage persistence) |
| `useAuth.js` | **DONE** — Context wrapper |
| `useChat.js` | EMPTY STUB |
| `useLawyers.js` | EMPTY STUB |
| All `.store.js` files | EMPTY STUBS |

---

## 13. ERROR HANDLING & VALIDATION

### Backend
- FastAPI automatic request validation via Pydantic schemas
- HTTP exceptions with appropriate status codes:
  - 400: Bad request (validation, business logic)
  - 401: Unauthorized (invalid credentials, expired/blacklisted token)
  - 403: Forbidden (wrong role)
  - 404: Not found (reservation, user, lawyer)
  - 409: Conflict (duplicate review, timeslot booked)
  - 429: AI quota exceeded
  - 502: AI service error

### Frontend
- `auth.api.js` uses try/catch with `.json().catch(() => null)` for safe parsing
- AuthContext catches and ignores logout errors
- `RoleRoute` and `PrivateRoute` handle redirects for unauthorized access

---

## 14. DESIGN PATTERNS & CONVENTIONS

### Backend
- **Router/Model/Schema pattern**: Each module has `router.py` (endpoints), `model.py` (SQLAlchemy), `schema.py` (Pydantic)
- **Dependency injection**: FastAPI's `Depends()` for DB sessions, auth, role checks
- **Service layer**: Complex business logic in separate `service.py` files (payment, AI)
- **Cascade deletes**: Account deletion cascades through all related tables in `cleanup_user_data()`
- **Blacklist pattern**: Token invalidation via database table (not just client-side removal)

### Frontend
- **Component structure**: `/components/{feature}/ComponentName.jsx`
- **Page structure**: `/pages/{role}/PageName.jsx`
- **API layer**: `/api/{feature}.api.js` with fetch-based functions
- **Context**: Global state via React Context (AuthContext)
- **Routing**: react-router-dom v7 with role-based guards (PrivateRoute, RoleRoute)
- **Styling**: Tailwind CSS v4 utility classes + custom theme tokens

---

## 15. DEPLOYMENT NOTES

- **No Dockerfile or Docker Compose** configured yet
- **No production deployment scripts** exist
- Frontend build: `cd frontend && npm run build` → outputs to `frontend/dist/`
- Backend served via `uvicorn app.main:app` (ASGI)
- Static files: `/uploads` mounted for profile image serving
- **Security note**: `Base.metadata.create_all()` used in development; production should use Alembic migrations
- CORS is configured via `ALLOWED_ORIGINS` env var (comma-separated)

---

## 16. THIRD-PARTY INTEGRATIONS

| Integration | Purpose | Package | Config |
|-------------|---------|---------|--------|
| Stripe | Payment processing | `stripe` Python lib | STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_CURRENCY, STRIPE_TEST_MODE |
| Google Gemini | AI chat provider | `google-genai` | GEMINI_API_KEY |
| Ollama | Local AI provider (fallback) | `ollama` Python lib | MODEL in chat/config.py |
| bcrypt | Password hashing | `bcrypt==3.2.0`, `passlib[bcrypt]` | — |
| Pillow | Image processing | `Pillow` | MAX_FILE_SIZE_MB, MAX_IMAGE_DIMENSION |
| PyMySQL | MySQL driver | `pymysql` | DATABASE_URL connection string |
| Alembic | DB migrations | `alembic` | alembic.ini |

---

## 17. ASSUMPTIONS & EDGE CASES

### AI Chat
- Edge case: Client gives city AND specialty in first message → acknowledge both, skip to Step 3
- Edge case: Vague problem description → one gentle follow-up before Step 1
- Edge case: Upset/stressed client → be empathetic but stay on task
- Edge case: Misspellings (e.g., "casblanca") → understand and proceed, do not correct
- Critical: AI must NEVER name specific lawyers or firms — the database handles that via [SEARCH_LAWYERS] tag

### Reservations
- Only pending reservations can be cancelled (by client) or rejected (by lawyer)
- Only accepted reservations can be completed (by lawyer)
- Lawyers can reschedule only pending reservations
- Timeslot conflict detection: prevents double-booking for same lawyer + datetime
- Lawyers must have active subscription to receive reservations

### Reviews
- Only completed reservations can be reviewed
- One review per reservation (duplicate check with 409 Conflict)
- 7-day edit/delete window from creation
- Lawyer rating_avg recalculated on every review create/update/delete

### Payments
- Boost requires active subscription (checked before creating Stripe intent)
- Test mode uses SetupIntent ($0, no real charge)
- Production mode uses PaymentIntent (real charge)
- Webhook handles both `payment_intent.succeeded` and `setup_intent.succeeded`

---

## 18. ROLE-PRIVILEGE MATRIX (from `role_privileges.json`)

### Public (unauthenticated)
- Register, Login, Request password reset, View lawyer reviews, View AI recommendations for a session

### Authenticated Any (any logged-in user)
- Logout, View/update own profile, Upload/delete profile picture, Delete own account, View own reservations, View review by reservation

### Client (extends Authenticated Any)
- All chat operations (create session, send message, history, delete), Create reservations, Cancel pending reservations, Write/edit/delete reviews (within 7 days), View own recommendations

### Lawyer (extends Authenticated Any)
- Update own lawyer profile, Subscribe + Renew + Cancel subscription, Purchase boosts, View payment history, Manage incoming reservations (accept/reject/complete/reschedule), View received reviews

### Admin (extends Authenticated Any)
- Check/expire subscriptions, View all reviews for moderation
- **Additional admin endpoints** (in admin router): Dashboard stats, User CRUD, Lawyer CRUD, Reservation oversight

---

## 19. DESIGN MOCKUPS (stitch-design directory)

The `stitch-design/` folder contains design mockups for the following screens:
- Landing page (`landing_page_2/`)
- Login/Sign Up (`sign_up_login/`)
- Lawyer directory (`lawyer_directory_2/`)
- Lawyer profile (`lawyer_profile/`)
- AI Legal Assistant (`ai_legal_assistant_2/`)
- Client dashboard (`client_dashboard_2/`)
- Lawyer dashboard (`lawyer_dashboard/`)
- Admin dashboard (`admin_dashboard/`)
- Book consultation (`book_consultation/`)
- Lawyer subscription (`lawyer_subscription/`)
- Boost visibility (`boost_visibility/`)
- Notifications hub (`notifications_hub/`)
- Messaging panel (`messaging_panel/`)
- Design system spec (`juris_slate/DESIGN.md`)

The design system follows "The Digital Jurist" philosophy: intentional asymmetry, tonal layering (background shifts instead of borders), glassmorphism for floating elements, and Inter typography with professional spacing.

---

## 20. QUICK START

### Prerequisites
- Python 3.x, Node.js, MySQL
- Stripe account (for payments) — optional in test mode
- Google Gemini API key (for AI) — optional if using Ollama

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
# Configure .env with your database URL, secret key, etc.
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Run Both Concurrently (from root)
```bash
npm install
npm run dev
```

Backend runs on `http://localhost:8000`, Frontend on `http://localhost:5173`.

---

*End of LawyerLink Platform Documentation — 39 API endpoints, 13 database tables, 3 user roles, 22 frontend routes.*

```
lawyerLink
├─ backend
│  ├─ alembic
│  │  ├─ env.py
│  │  ├─ README
│  │  ├─ script.py.mako
│  │  └─ versions
│  │     ├─ 0e4e997b95d5_add_city_and_region_to_users_and_lawyers.py
│  │     ├─ 535a74706b71_your_change.py
│  │     ├─ 69a8ed0c404f_remove_the_imageurl_from_client_and_.py
│  │     ├─ 6f255ac9b794_add_created_at_to_reservations.py
│  │     ├─ 8df2949cf265_add_location_fields.py
│  │     └─ 9f5af3447c79_add_created_at_to_payment_transactions.py
│  ├─ alembic.ini
│  ├─ app
│  │  ├─ admin
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  └─ __init__.py
│  │  ├─ auth
│  │  │  ├─ password_reset.py
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  └─ __init__.py
│  │  ├─ chat
│  │  │  ├─ ai_service.py
│  │  │  ├─ cache.py
│  │  │  ├─ config.py
│  │  │  ├─ gemini_service.py
│  │  │  ├─ model.py
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  ├─ service.py
│  │  │  └─ __init__.py
│  │  ├─ core
│  │  │  ├─ blacklist.py
│  │  │  ├─ config.py
│  │  │  ├─ database.py
│  │  │  ├─ dependencies.py
│  │  │  ├─ security.py
│  │  │  ├─ upload.py
│  │  │  └─ __init__.py
│  │  ├─ lawyer
│  │  │  ├─ model.py
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  └─ __init__.py
│  │  ├─ main.py
│  │  ├─ payment
│  │  │  ├─ model.py
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  ├─ service.py
│  │  │  └─ __init__.py
│  │  ├─ recommendation
│  │  │  ├─ model.py
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  └─ __init__.py
│  │  ├─ reservation
│  │  │  ├─ model.py
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  └─ __init__.py
│  │  ├─ review
│  │  │  ├─ model.py
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  └─ __init__.py
│  │  ├─ role_privileges.json
│  │  ├─ user
│  │  │  ├─ model.py
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ features.json
│  ├─ readme.md
│  ├─ requirements.txt
│  └─ tests
│     ├─ conftest.py
│     ├─ test_auth.py
│     ├─ test_chat.py
│     ├─ test_lawyer.py
│     ├─ test_payment.py
│     ├─ test_reservation.py
│     ├─ test_user.py
│     └─ __init__.py
├─ frontend
│  ├─ dist
│  │  ├─ assets
│  │  │  ├─ index-D1o07QBG.css
│  │  │  └─ index-yobSB_mD.js
│  │  ├─ favicon.svg
│  │  ├─ icons.svg
│  │  └─ index.html
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ api
│  │  │  ├─ auth.api.js
│  │  │  ├─ axios.js
│  │  │  ├─ chat.api.js
│  │  │  ├─ lawyer.api.js
│  │  │  ├─ payment.api.js
│  │  │  ├─ reservation.api.js
│  │  │  └─ review.api.js
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ chat
│  │  │  │  ├─ ChatInput.jsx
│  │  │  │  ├─ ChatMessage.jsx
│  │  │  │  └─ ChatWindow.jsx
│  │  │  ├─ common
│  │  │  │  ├─ FormButton.jsx
│  │  │  │  ├─ FormInput.jsx
│  │  │  │  ├─ LoadingSpinner.jsx
│  │  │  │  ├─ Modal.jsx
│  │  │  │  ├─ Pagination.jsx
│  │  │  │  ├─ PrivateRoute.jsx
│  │  │  │  ├─ RoleRoute.jsx
│  │  │  │  └─ RoleSelector.jsx
│  │  │  ├─ lawyer
│  │  │  │  ├─ LawyerCard.jsx
│  │  │  │  ├─ LawyerFilter.jsx
│  │  │  │  └─ StarRating.jsx
│  │  │  ├─ layout
│  │  │  │  ├─ Footer.jsx
│  │  │  │  ├─ Navbar.jsx
│  │  │  │  └─ Sidebar.jsx
│  │  │  ├─ payment
│  │  │  │  └─ PaymentForm.jsx
│  │  │  └─ reservation
│  │  │     ├─ ReservationCard.jsx
│  │  │     └─ StatusBadge.jsx
│  │  ├─ context
│  │  │  └─ AuthContext.jsx
│  │  ├─ hooks
│  │  │  ├─ useAuth.js
│  │  │  ├─ useChat.js
│  │  │  └─ useLawyers.js
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ admin
│  │  │  │  ├─ AdminDashboard.jsx
│  │  │  │  ├─ LawyerApprovalPage.jsx
│  │  │  │  └─ UsersPage.jsx
│  │  │  ├─ auth
│  │  │  │  ├─ LoginPage.jsx
│  │  │  │  └─ RegisterPage.jsx
│  │  │  ├─ client
│  │  │  │  ├─ ChatPage.jsx
│  │  │  │  ├─ LawyerListPage.jsx
│  │  │  │  ├─ LawyerProfilePage.jsx
│  │  │  │  ├─ MyReservationsPage.jsx
│  │  │  │  ├─ RecommendationsPage.jsx
│  │  │  │  ├─ ReservationPage.jsx
│  │  │  │  └─ ReviewPage.jsx
│  │  │  ├─ LandingPage.jsx
│  │  │  └─ lawyer
│  │  │     ├─ BoostPage.jsx
│  │  │     ├─ DashboardPage.jsx
│  │  │     ├─ MyReservationsPage.jsx
│  │  │     ├─ ProfileEditPage.jsx
│  │  │     └─ SubscriptionPage.jsx
│  │  ├─ store
│  │  │  ├─ auth.store.js
│  │  │  ├─ chat.store.js
│  │  │  └─ reservation.store.js
│  │  └─ utils
│  │     ├─ constants.js
│  │     └─ formatDate.js
│  └─ vite.config.js
├─ package.json
├─ rapport.md
├─ readme.md
├─ stitch-design
│  ├─ admin_dashboard
│  │  ├─ code.html
│  │  └─ screen.png
│  ├─ ai_legal_assistant_2
│  │  ├─ code.html
│  │  └─ screen.png
│  ├─ book_consultation
│  │  ├─ code.html
│  │  └─ screen.png
│  ├─ boost_visibility
│  │  ├─ code.html
│  │  └─ screen.png
│  ├─ client_dashboard_2
│  │  ├─ code.html
│  │  └─ screen.png
│  ├─ juris_slate
│  │  └─ DESIGN.md
│  ├─ landing_page_2
│  │  ├─ code.html
│  │  └─ screen.png
│  ├─ lawyerlink_prd.html
│  ├─ lawyer_dashboard
│  │  ├─ code.html
│  │  └─ screen.png
│  ├─ lawyer_directory_2
│  │  ├─ code.html
│  │  └─ screen.png
│  ├─ lawyer_profile
│  │  ├─ code.html
│  │  └─ screen.png
│  ├─ lawyer_subscription
│  │  ├─ code.html
│  │  └─ screen.png
│  ├─ messaging_panel
│  │  ├─ code.html
│  │  └─ screen.png
│  ├─ notifications_hub
│  │  ├─ code.html
│  │  └─ screen.png
│  └─ sign_up_login
│     ├─ code.html
│     └─ screen.png
└─ test.json

```