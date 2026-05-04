from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from db import engine
from models import Product

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/")
def get_products():
    with Session(engine) as session:
        products = session.exec(select(Product)).all()
        return products


@router.get("/{product_id}")
def get_product(product_id: int):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product


@router.post("/seed")
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