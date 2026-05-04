# 🍸 Liquid Alchemy — Cocktail E-commerce Platform

A full-stack cocktail e-commerce platform built with React, FastAPI, and MySQL.  
The project allows users to browse a curated cocktail collection, explore flavour profiles, manage a shopping cart, and complete a checkout flow.

---

## Project Overview

This project reinterprets the classic shopping cart assignment as a cocktail-focused e-commerce platform.  
Instead of a standard retail interface, it combines a minimalist industrial visual style with an experimental product storytelling approach.

The website includes:

- Age verification gate
- Hero section with branded editorial styling
- Flavour matrix filter
- Responsive product collection grid
- Cart drawer with upsell recommendations
- Wishlist management
- User authentication
- Checkout and payment flow
- User account and order history
- Dynamic CRUD operations connected to a MySQL database

---

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- FastAPI
- SQLModel
- Uvicorn

### Database
- MySQL

### Other Tools
- Python virtual environment (`venv`)
- MySQL Workbench
- Git / GitHub

---

## Project Structure

```text
ecommerce-shopping-cart/
├── backend/
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── products.py
│   │   ├── cart.py
│   │   ├── users.py
│   │   ├── orders.py
│   │   └── wishlist.py
│   ├── .venv/
│   ├── .env              ← create this yourself (see below)
│   ├── .env.example      ← reference for required variables
│   ├── db.py
│   ├── main.py
│   ├── models.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── images/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── ProductCard.jsx
│       │   └── AgeVerificationModal.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── ProductListing.jsx
│       │   ├── ProductDetail.jsx
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Cart.jsx
│       │   ├── Checkout.jsx
│       │   ├── PaymentSuccess.jsx
│       │   ├── Wishlist.jsx
│       │   ├── Account.jsx
│       │   └── NotFound.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
│
├── database/
│   ├── database_notes.md
│   └── schema.sql
│
└── README.md
```

---

## Page Ownership

| Page | File | Owner |
|------|------|-------|
| Landing Page | pages/Home.jsx | Evelyn |
| Product Listing | pages/ProductListing.jsx | Evelyn |
| Login / Signup | pages/Login.jsx, pages/Signup.jsx | 成员 A |
| Cart / Checkout / Payment | pages/Cart.jsx, pages/Checkout.jsx, pages/PaymentSuccess.jsx | 成员 B |
| Wishlist / Account | pages/Wishlist.jsx, pages/Account.jsx | 成员 C |

---

## Getting Started

### Prerequisites
- Node.js
- Python 3.x
- MySQL

---

### 1. Clone the Repository
```text
git clone https://github.com/evelynZ99/liquid-alchemy-shopping-cart
cd ecommerce-shopping-cart
```

### 2. Database Setup
```text
mysql -u root -p < database/schema.sql
```

### 3. Backend Setup
```text
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create your `.env` file inside `backend/`:
```text
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_cart_db
```

Run the backend:
```text
uvicorn main:app --reload
```

Backend will run at: http://127.0.0.1:8000

### 4. Frontend Setup
Open a new terminal:
```text
cd frontend
npm install
npm run dev
```

Frontend will run at: http://localhost:5173

### 5. Seed Sample Products

After the backend is running, open:  
http://127.0.0.1:8000/docs

Then run:
- POST /products/seed

---

## API Endpoints

### Products
- `GET /products/` — Get all products
- `GET /products/{id}` — Get product by ID
- `POST /products/seed` — Seed sample products

### Cart
- `GET /cart/` — Get cart items
- `POST /cart/` — Add item to cart
- `PUT /cart/{id}` — Update item quantity
- `DELETE /cart/{id}` — Remove item
- `DELETE /cart/` — Clear cart

### Users *(TODO — 成员 A)*
- `POST /users/register`
- `POST /users/login`
- `GET /users/{id}`

### Wishlist *(TODO — 成员 C)*
- `GET /wishlist/{user_id}`
- `POST /wishlist/`
- `DELETE /wishlist/{id}`

### Orders *(TODO — 成员 B)*
- `POST /orders/`
- `GET /orders/{id}`
- `GET /orders/user/{user_id}`

---

## Database Structure

Database name: `ecommerce_cart_db`

| Table | Description |
|-------|-------------|
| users | User accounts |
| products | Cocktail and product data |
| cart_items | Products added to cart |
| wishlist_items | Products saved to wishlist |
| orders | Order records |
| order_items | Individual items within each order |

---

## Git Workflow

1. Never commit directly to `main`
2. Always branch from `dev`
```text
git checkout dev
git pull
git checkout -b feature/your-feature-name
```
3. When done, push and open a Pull Request to `dev`
```text
git push origin feature/your-feature-name
```
4. Wait for code review before merging

---

## Main Features

- Age verification gate
- Single-page application style interface
- Responsive landing page layout
- Flavour Matrix filter using sliders
- Product collection grid with responsive layout
- Add products to cart
- Update cart item quantity
- Remove individual cart item
- Clear entire cart
- Dynamic cart subtotal calculation
- Upsell recommendation section inside cart drawer

---

## Responsive Design

- **Large screens:** 4 products per row
- **Medium screens:** 3 products per row
- **Mobile screens:** 2 products per row

---

## Design Direction

The interface was inspired by:
- Premium minimalist product websites
- Cocktail menu editorial layouts
- Experimental visual storytelling

---

## Author
- Name: Evelyn Zhou
- Subject: Internet Programming
- Assignment: Dynamic Web Interface to a Database System