from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from sqlalchemy import text
from db import engine, create_db_and_tables
from models import Product, CartItem


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def read_root():
    return {"message": "Backend is running"}


@app.get("/db-test")
def db_test():
    with Session(engine) as session:
        row = session.exec(text("SELECT 1 AS test_value")).one()
        return {"database": "connected", "result": int(row[0])}


@app.post("/seed-products")
def seed_products():

    with Session(engine) as session:
        existing_products = session.exec(select(Product)).all()
        if existing_products:
            return {"message": "Products already exist"}

        products = [
            Product(
                name="Cucumber Salad Single",
                description="Hendrick's Gin, Mezcal, Olive Brine",
                price=35.00,
                image_url="/images/cucumber-salad.png",
                category="Savory / Fresh",
                stock=12,
            ),
            Product(
                name="Pineappu Beach Single",
                description="Japanese Whisky, Yuzu Umeshu, Pineapple Cordial",
                price=38.00,
                image_url="/images/pineappu-beach.png",
                category="Sweet / Sour",
                stock=10,
            ),
            Product(
                name="Shima Fizzy Kit",
                description="Mezcal, Dashi, Watermelon Soda",
                price=75.00,
                image_url="/images/shima-fizzy.png",
                category="Fizzy / Experimental",
                stock=8,
            ),
            
            Product(
                name="Smoky Chile & Honey",
                description="Islay Whisky, Scotch Whisky, Chile Pepper Liqueur, Elderflower Liqueur, Honey, Lemon",
                price=39.00,
                image_url="/images/smoky-chile-honey.png",
                category="Sweet & Sour",
                stock=10,
            ),
            Product(
                name="Carrot Cake",
                description="Suntory Kakubin Whisky, White Rum, Lillet Blanc, Butter, Carrot Juice, Almond Milk, Orgeat, Cinnamon, Lemon",
                price=39.00,
                image_url="/images/carrot-cake.png",
                category="Sweet & Sour",
                stock=10,
            ),
            Product(
                name="Tomato Cobbler",
                description="Fino Sherry, Tomato Syrup, Lemon Juice",
                price=35.00,
                image_url="/images/tomato-cobbler.png",
                category="Sweet & Sour",
                stock=10,
            ),
            Product(
                name="Kicu In The Sidecar",
                description="Chrysanthemum Sake, Apricot Liqueur, D.O.M Benedictine, Lemon",
                price=39.00,
                image_url="/images/kicu-sidecar.png",
                category="Sweet & Sour",
                stock=10,
            ),
            Product(
                name="Shiozakura Collins",
                description="Roku Gin, Sakura Vermouth, Shio-zakura Saline Solution, Lemon, Simple Syrup, CO2",
                price=38.00,
                image_url="/images/shiozakura-collins.png",
                category="Refreshing",
                stock=10,
            ),
        ]
        

        session.add_all(products)
        session.commit()

        return {"message": "Sample products added successfully"}

@app.get("/products")
def get_products():
    with Session(engine) as session:
        products = session.exec(select(Product)).all()
        return products

@app.get("/products")
def get_products():
    with Session(engine) as session:
        products = session.exec(select(Product)).all()
        return products


@app.get("/cart")
def get_cart():
    with Session(engine) as session:
        cart_items = session.exec(select(CartItem)).all()

        result = []
        for item in cart_items:
            product = session.get(Product, item.product_id)
            if product:
                result.append({
                    "cart_item_id": item.id,
                    "product_id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "image_url": product.image_url,
                    "quantity": item.quantity,
                    "subtotal": product.price * item.quantity
                })

        return result


@app.post("/cart")
def add_to_cart(product_id: int, quantity: int = 1):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        existing_cart_item = session.exec(
            select(CartItem).where(CartItem.product_id == product_id)
        ).first()

        if existing_cart_item:
            existing_cart_item.quantity += quantity
            session.add(existing_cart_item)
            session.commit()
            session.refresh(existing_cart_item)
            return {"message": "Cart item updated", "cart_item_id": existing_cart_item.id}

        new_cart_item = CartItem(product_id=product_id, quantity=quantity)
        session.add(new_cart_item)
        session.commit()
        session.refresh(new_cart_item)

        return {"message": "Item added to cart", "cart_item_id": new_cart_item.id}


@app.put("/cart/{cart_item_id}")
def update_cart_item(cart_item_id: int, quantity: int):
    with Session(engine) as session:
        cart_item = session.get(CartItem, cart_item_id)
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

        cart_item.quantity = quantity
        session.add(cart_item)
        session.commit()
        session.refresh(cart_item)

        return {"message": "Cart item updated successfully"}


@app.delete("/cart/{cart_item_id}")
def delete_cart_item(cart_item_id: int):
    with Session(engine) as session:
        cart_item = session.get(CartItem, cart_item_id)
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        session.delete(cart_item)
        session.commit()

        return {"message": "Cart item deleted successfully"}

@app.delete("/cart")
def clear_cart():
    with Session(engine) as session:
        cart_items = session.exec(select(CartItem)).all()

        for item in cart_items:
            session.delete(item)

        session.commit()

        return {"message": "Cart cleared successfully"}