# Liquid Alchemy — Cocktail E-commerce Platform

A full-stack cocktail e-commerce platform built with React, FastAPI, and MySQL. Users can browse a curated collection of cocktails, glassware, and bar kits, manage a shopping cart and wishlist, and complete a checkout flow. An admin panel provides full CRUD management over products, users, and orders.

---

## Features

### Customer-facing
- **Age Verification Gate** — enforced on first visit; state persisted in localStorage
- **Home Page** — editorial hero section, cocktail collection grid, flavour profile scales, cart drawer
- **Product Listing** — multi-filter sidebar (category, price, spirit, flavour, occasion, difficulty), search, wishlist toggle, cart drawer with upsell section
- **Product Detail** — flavour matrix scales, attributes, quantity selector, add to cart, wishlist toggle
- **Guest Cart & Wishlist** — unauthenticated users can add to cart and save to wishlist via localStorage; data is automatically merged into their account upon login
- **Cart Page** — full cart management (quantity, remove, clear), order summary with tax estimate
- **Checkout** — shipping address, shipping method selection, payment details with live card preview; requires login (redirects guests automatically)
- **Payment Success** — order confirmation page
- **User Account** — profile editing, password change, wishlist, cart, and order history in a tabbed sidebar layout
- **Navbar** — cart count badge (guest + logged-in), wishlist icon, account icon, sign in / sign out

### Admin Panel (`/admin`)
- **Dashboard** — summary cards for total users, products, orders, and cart activity
- **Products** — create, edit, delete products; image upload from local file or URL; category/spirit/flavour/difficulty/occasion dropdowns populated from existing product data
- **Users** — create users (21+ age validation), edit username and date of birth, reset password to DOB-based default (with optional email notification), delete user with cascade (cart, wishlist, orders)
- **Orders** — view all orders, order detail modal with line items, images, and customer info
- **Carts** — view active carts by user

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, CSS |
| Backend | FastAPI, SQLModel, Uvicorn |
| Database | MySQL |
| ORM | SQLAlchemy (via SQLModel) |
| Auth | Custom (localStorage session, bcrypt hashing) |
| Image Upload | python-multipart, FastAPI StaticFiles |
| Email | smtplib (SMTP, optional) |

---

## Project Structure

```
liquid-alchemy-shopping-cart/
├── backend/
│   ├── routers/
│   │   ├── products.py
│   │   ├── cart.py
│   │   ├── users.py
│   │   ├── orders.py
│   │   ├── wishlist.py
│   │   └── admin.py
│   ├── uploads/              ← uploaded product images (auto-created)
│   ├── .venv/
│   ├── .env                  ← create this yourself (see below)
│   ├── db.py
│   ├── deps.py
│   ├── main.py
│   ├── models.py
│   ├── security.py
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── admin/
│       │   │   ├── AdminLayout.jsx
│       │   │   └── admin.css
│       │   ├── AgeVerificationModal.jsx
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   └── ProductCard.jsx
│       ├── pages/
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── AdminProducts.jsx
│       │   │   ├── AdminUsers.jsx
│       │   │   ├── AdminOrders.jsx
│       │   │   └── AdminCarts.jsx
│       │   ├── Home.jsx
│       │   ├── ProductListing.jsx
│       │   ├── ProductDetail.jsx
│       │   ├── Cart.jsx
│       │   ├── Checkout.jsx
│       │   ├── PaymentSuccess.jsx
│       │   ├── Account.jsx
│       │   ├── Wishlist.jsx
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Laboratory.jsx
│       │   └── NotFound.jsx
│       ├── services/
│       │   └── api.js
│       ├── utils/
│       │   ├── auth.js
│       │   ├── guestCart.js
│       │   └── flavourData.js
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
├── database/
│   └── schema.sql
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- MySQL

### 1. Clone the Repository

```bash
git clone https://github.com/evelynZ99/liquid-alchemy-shopping-cart
cd liquid-alchemy-shopping-cart
```

### 2. Database Setup

Create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

### 3. Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_cart_db
ADMIN_KEY=your_secret_admin_key

# Optional — for admin password reset emails
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

Start the backend:

```bash
uvicorn main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`  
API docs available at: `http://127.0.0.1:8000/docs`

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 5. Seed Products

With the backend running, visit `http://127.0.0.1:8000/docs` and call:

```
POST /products/seed
```

### 6. Create an Admin Account

Register at `/signup` and provide your `ADMIN_KEY` in the admin key field, or call `POST /users/register` directly with `is_admin: true` and the key.

---

## API Endpoints

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products/` | List all products |
| GET | `/products/{id}` | Get product by ID |
| POST | `/products/` | Create product (admin) |
| PUT | `/products/{id}` | Update product (admin) |
| DELETE | `/products/{id}` | Delete product (admin) |
| POST | `/products/seed` | Seed sample data |
| POST | `/upload-image` | Upload product image (admin) |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart/` | Get user's cart |
| GET | `/cart/all` | Get all users' carts (admin) |
| POST | `/cart/` | Add item to cart |
| PUT | `/cart/{id}` | Update item quantity |
| DELETE | `/cart/{id}` | Remove item |
| DELETE | `/cart/` | Clear cart |

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/users/register` | Register new user |
| POST | `/users/login` | Login |
| GET | `/users/` | List all users (admin) |
| GET | `/users/{id}` | Get user |
| PATCH | `/users/{id}/profile` | Update username / date of birth |
| PATCH | `/users/{id}/password` | Change password |
| PATCH | `/users/{id}/role` | Update admin role (admin) |
| POST | `/users/{id}/reset-password` | Reset to DOB-based password (admin) |
| DELETE | `/users/{id}` | Delete user with cascade (admin) |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders/` | Create order |
| GET | `/orders/` | List all orders (admin) |
| GET | `/orders/{id}` | Get order detail |
| GET | `/orders/user/{id}` | Get user's order history |

### Wishlist
| Method | Endpoint | Description |
|---|---|---|
| GET | `/wishlist/{user_id}` | Get user's wishlist |
| POST | `/wishlist/` | Add item to wishlist |
| DELETE | `/wishlist/{id}` | Remove item from wishlist |

---

## Database Schema

Database name: `ecommerce_cart_db`

| Table | Description |
|---|---|
| `users` | User accounts (username, email, password hash, DOB, is_admin) |
| `products` | Product catalogue (name, category, price, stock, image, attributes) |
| `cart_items` | Active cart items per user |
| `wishlist_items` | Saved wishlist items per user |
| `orders` | Order records (user, total, status, timestamp) |
| `order_items` | Line items within each order (product, quantity, price at purchase) |

---

## Guest Cart & Wishlist

Unauthenticated users can freely browse, add products to cart, and save to wishlist. Data is stored in localStorage under the keys `liquidAlchemyGuestCart` and `liquidAlchemyGuestWishlist`.

On login, guest cart and wishlist items are automatically merged into the user's server-side account and cleared from localStorage. Guests attempting to proceed to checkout are redirected to `/login`.

---

## Design

The interface draws from premium minimalist product design and editorial cocktail aesthetics — dark backgrounds, serif typography (Newsreader), fine line details, and muted earth tones. Product storytelling is emphasised through flavour profile scales and curated attribute tags.

---

## Team & Workload Allocation

| Member | Responsibilities | Key Files |
|---|---|---|
| **Evelyn Zhou** | Product pages, Navbar, Footer, guest cart/wishlist, integration testing | `pages/Home.jsx`, `pages/ProductListing.jsx`, `pages/ProductDetail.jsx`, `components/Navbar.jsx`, `components/Footer.jsx`, `utils/guestCart.js`, `services/api.js`, `App.css` |
| **Tianya** | Full admin panel (dashboard, products, users, orders, carts), product image upload | `pages/admin/AdminDashboard.jsx`, `pages/admin/AdminProducts.jsx`, `pages/admin/AdminUsers.jsx`, `pages/admin/AdminOrders.jsx`, `pages/admin/AdminCarts.jsx`, `components/admin/AdminLayout.jsx`, `components/admin/admin.css`, `routers/admin.py`, `main.py` |
| **Jasmine** | Cart, Wishlist, Checkout, Payment Success, backend cart and wishlist routes | `pages/Cart.jsx`, `pages/Wishlist.jsx`, `pages/Checkout.jsx`, `pages/PaymentSuccess.jsx`, `routers/cart.py`, `routers/wishlist.py` |
| **Chuanyao** | User authentication, Age Verification Modal, User Account page (Profile, Order History, Settings), backend user and order routes | `pages/Login.jsx`, `pages/Signup.jsx`, `pages/Account.jsx`, `components/AgeVerificationModal.jsx`, `routers/users.py`, `routers/orders.py`, `security.py`, `deps.py` |

> Integration, final testing, and cross-member coordination were led by Evelyn.
