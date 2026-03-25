
```
lawyerLink
├─ backend
│  ├─ .env.example
│  ├─ app
│  │  ├─ auth
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  └─ __init__.py
│  │  ├─ chat
│  │  │  ├─ model.py
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  └─ __init__.py
│  │  ├─ core
│  │  │  ├─ config.py
│  │  │  ├─ database.py
│  │  │  ├─ dependencies.py
│  │  │  ├─ security.py
│  │  │  └─ __init__.py
│  │  ├─ database.py
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
│  │  ├─ user
│  │  │  ├─ model.py
│  │  │  ├─ router.py
│  │  │  ├─ schema.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ requirements.txt
│  └─ tests
│     ├─ conftest.py
│     ├─ test_auth.py
│     ├─ test_lawyer.py
│     ├─ test_payment.py
│     ├─ test_reservation.py
│     └─ __init__.py
├─ backend_structure.txt
├─ export_project_structure.py
├─ frontend
│  ├─ .env.example
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
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
│  │  │  │  ├─ LoadingSpinner.jsx
│  │  │  │  ├─ Modal.jsx
│  │  │  │  ├─ Pagination.jsx
│  │  │  │  ├─ PrivateRoute.jsx
│  │  │  │  └─ RoleRoute.jsx
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
├─ frontend_structure.txt
└─ readme.md

```