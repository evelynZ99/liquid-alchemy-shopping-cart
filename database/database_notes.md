# Database Notes

## Database System
This project uses **MySQL** as the database system.

## Database Name
- `ecommerce_cart_db`

## Main Tables
- `product`
- `cartitem`

## Table Purpose

### product
Stores all cocktail and related product information displayed on the landing page.

Main fields include:
- `id`
- `name`
- `description`
- `price`
- `image_url`
- `category`
- `stock`

### cartitem
Stores the products that users add to the shopping cart.

Main fields include:
- `id`
- `product_id`
- `quantity`

## How the Database Works
The database tables are created automatically through **SQLModel** when the FastAPI backend starts.

This is handled in:
- `backend/models.py`
- `backend/db.py`
- `backend/main.py`

## Sample Data
Sample product data is inserted through the API endpoint:

- `POST /seed-products`

This allows the project to quickly populate the database with initial cocktail product data for testing and demonstration.

## Cart Operations
The shopping cart data is managed through the following API endpoints:

- `GET /cart`
- `POST /cart`
- `PUT /cart/{cart_item_id}`
- `DELETE /cart/{cart_item_id}`
- `DELETE /cart`

## Notes
The `database/` folder is used as a project documentation folder only.

The actual data is stored inside the local MySQL database server, not as files inside this folder.