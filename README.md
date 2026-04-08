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

```

---

## Folder Explanation

frontend/

Contains the React application, page layout, UI styling, and API request logic.

backend/

Contains the FastAPI server, database connection, SQLModel models, and API endpoints.

frontend/public/images/

Stores all local product images used in the landing page and cart drawer.

database/

Contains documentation and SQL reference files for the database structure.

---

## Database Structure

This project uses a MySQL database named:
	•	ecommerce_cart_db

Main tables:
	•	product
	•	cartitem

product

Stores cocktail and product data shown on the landing page.

Fields:
	•	id
	•	name
	•	description
	•	price
	•	image_url
	•	category
	•	stock

cartitem

Stores products added to the shopping cart.

Fields:
	•	id
	•	product_id
	•	quantity

---

## API Endpoints

Product Endpoints
	•	GET /products — get all products
	•	POST /seed-products — insert sample product data

Cart Endpoints
	•	GET /cart — get all cart items
	•	POST /cart — add a product to cart
	•	PUT /cart/{cart_item_id} — update cart item quantity
	•	DELETE /cart/{cart_item_id} — remove a single cart item
	•	DELETE /cart — clear the entire cart

---
## Installation and Setup

1. Clone the repository
```text
git clone https://github.com/evelynZ99/liquid-alchemy-shopping-cart
cd ecommerce-shopping-cart
```

2. Start the backend
```text
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

3. Start the frontend
Open a new terminal:
```text
cd frontend
npm install
npm run dev
```

4. Configure MySQL

Create a MySQL database:
```text 
CREATE DATABASE ecommerce_cart_db;
```

Create a .env file inside backend/:
```text
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_cart_db
```

5. Seed sample products

After the backend is running, open:
http://127.0.0.1:8000/docs

Then run:
	•	POST /seed-products

This inserts the sample cocktail product data into the database.

---
## How to Use
	1.	Open the landing page in the browser.
	2.	Browse the cocktail collection.
	3.	Adjust the Flavor Matrix sliders to filter products.
	4.	Click Add to cart on any product.
	5.	The right-side cart drawer opens automatically.
	6.	Increase or decrease quantity using + and -.
	7.	Click Remove to delete one cart item completely.
	8.	Click Clear cart to remove all items from the cart.
	9.	Review subtotal and explore recommended products in the drawer.
	
---
## Design Direction

The interface was inspired by:
	•	premium minimalist product websites
	•	cocktail menu editorial layouts
	•	experimental visual storytelling

The design combines:
	•	neutral background tones
	•	serif display typography
	•	restrained industrial color accents
	•	structured product cards
	•	a cart drawer interaction instead of a full separate cart page

---
## Challenges and Solutions

One challenge was connecting the React frontend, FastAPI backend, and MySQL database correctly. This required setting up the Python virtual environment, configuring the database connection, and testing API endpoints independently before frontend integration.

Another challenge was ensuring that product images displayed consistently. Since external placeholder images were unreliable, local product images were stored inside the frontend public/images folder and referenced through database image paths.

A further challenge was making the layout responsive while keeping the visual style consistent. This was solved through CSS grid breakpoints, allowing the product collection to adapt from four columns on desktop to two columns on mobile.

The cart drawer also required careful UI logic so that it could open after adding items, support quantity updates, remove individual products, and clear the entire cart smoothly.

---
## Future Improvements
	•	Add category tabs or a more advanced filter system
	•	Add stock validation to prevent over-ordering
	•	Add toast notifications for cart actions
	•	Add search functionality
	•	Add product detail popups
	•	Add checkout simulation
	•	Improve recommendation logic based on flavour pairing

---
## Author
	•	Name: Evelyn Zhou
	•	Subject: Internet Programming
	•	Assignment: Dynamic Web Interface to a Database System