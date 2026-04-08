# Liquid Alchemy — Cocktail E-commerce Shopping Cart

A single-page e-commerce web application inspired by premium editorial product pages and experimental cocktail menus.  
The project allows users to browse a curated cocktail collection, explore flavour profiles, add products to a shopping cart, update quantities, remove individual items, and clear the entire cart through a database-connected interface.

---

## Project Overview

This project reinterprets the classic shopping cart assignment as a cocktail-focused landing page.  
Instead of a standard retail interface, it combines a minimalist industrial visual style with a more experimental product storytelling approach.

The website includes:

- a hero section
- a flavour matrix filter
- a responsive product collection grid
- a right-side cart drawer
- upsell recommendations
- dynamic CRUD operations connected to a MySQL database

---

## Problem Statement

Traditional shopping cart demos often focus only on functionality.  
This project aims to demonstrate both:

1. **dynamic full-stack CRUD functionality**
2. **a more refined branded user experience**

Users can browse cocktail products, filter them visually by flavour characteristics, and manage cart items in real time without reloading the page.

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

## Main Features

- Single-page application style interface
- Responsive landing page layout
- Hero section with branded editorial styling
- Flavour Matrix filter using sliders
- Product collection grid with responsive layout
- Local product images stored in `frontend/public/images`
- Add products to cart
- Automatically open cart drawer after add-to-cart
- Update cart item quantity
- Remove an individual cart item
- Clear the entire shopping cart
- Dynamic cart subtotal calculation
- Upsell recommendation section inside cart drawer
- Database-driven product and cart data

---

## Responsive Design

The layout is responsive across different screen sizes:

- **Large screens:** 4 products per row
- **Medium screens:** 3 products per row
- **Mobile screens:** 2 products per row

The cart drawer also adapts for smaller screens and expands to full width on mobile.

---

## Project Structure

```text
ecommerce-shopping-cart/
├── backend/
│   ├── .venv/
│   ├── .env
│   ├── db.py
│   ├── main.py
│   ├── models.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── database_notes.md
│   └── schema.sql
│
└── README.md