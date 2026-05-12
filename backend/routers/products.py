from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from db import engine
from models import Product, ProductCreate, ProductUpdate, User
from deps import require_admin

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


@router.post("/", response_model=Product)
def create_product(
    product_in: ProductCreate,
    admin_user: User = Depends(require_admin),
):
    with Session(engine) as session:
        product = Product(**product_in.model_dump())
        session.add(product)
        session.commit()
        session.refresh(product)
        return product


@router.put("/{product_id}", response_model=Product)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    admin_user: User = Depends(require_admin),
):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        update_data = product_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)
        session.add(product)
        session.commit()
        session.refresh(product)
        return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    admin_user: User = Depends(require_admin),
):
    with Session(engine) as session:
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        session.delete(product)
        session.commit()
        return {"message": "Product deleted"}


@router.post("/seed")
def seed_products(force: bool = False):
    with Session(engine) as session:
        existing = session.exec(select(Product)).all()
        if existing and not force:
            return {"message": f"Products already exist ({len(existing)} items). Use ?force=true to reseed."}
        for p in existing:
            session.delete(p)
        session.commit()

        products = [
            # ── Cocktails ──────────────────────────────────────────────────────
            Product(name="Cucumber Salad Single",
                    description="Hendrick's Gin, Mezcal, Olive Brine",
                    price=35.00, image_url="/images/cucumber-salad.png",
                    category="Cocktails", stock=12,
                    alcohol_type="Gin, Mezcal", flavor_profile="Savory",
                    difficulty="Medium", occasion="Casual"),
            Product(name="Pineappu Beach Single",
                    description="Japanese Whisky, Yuzu Umeshu, Pineapple Cordial",
                    price=38.00, image_url="/images/pineappu-beach.png",
                    category="Cocktails", stock=10,
                    alcohol_type="Whisky", flavor_profile="Sweet & Sour",
                    difficulty="Easy", occasion="Casual"),
            Product(name="Smoky Chile & Honey",
                    description="Islay Whisky, Scotch Whisky, Chile Pepper Liqueur, Elderflower Liqueur, Honey, Lemon",
                    price=39.00, image_url="/images/smoky-chile-honey.png",
                    category="Cocktails", stock=10,
                    alcohol_type="Whisky", flavor_profile="Smoky & Sweet",
                    difficulty="Medium", occasion="Date Night"),
            Product(name="Carrot Cake",
                    description="Suntory Kakubin Whisky, White Rum, Lillet Blanc, Butter, Carrot Juice, Almond Milk, Orgeat, Cinnamon, Lemon",
                    price=39.00, image_url="/images/carrot-cake.png",
                    category="Cocktails", stock=10,
                    alcohol_type="Whisky, Rum", flavor_profile="Sweet & Creamy",
                    difficulty="Advanced", occasion="Celebration"),
            Product(name="Tomato Cobbler",
                    description="Fino Sherry, Tomato Syrup, Lemon Juice",
                    price=35.00, image_url="/images/tomato-cobbler.png",
                    category="Cocktails", stock=10,
                    alcohol_type="Sherry", flavor_profile="Savory & Bright",
                    difficulty="Easy", occasion="Casual"),
            Product(name="Kicu In The Sidecar",
                    description="Chrysanthemum Sake, Apricot Liqueur, D.O.M Benedictine, Lemon",
                    price=39.00, image_url="/images/kicu-sidecar.png",
                    category="Cocktails", stock=10,
                    alcohol_type="Sake", flavor_profile="Floral & Citrus",
                    difficulty="Medium", occasion="Date Night"),
            Product(name="Shiozakura Collins",
                    description="Roku Gin, Sakura Vermouth, Shio-zakura Saline Solution, Lemon, Simple Syrup, CO2",
                    price=38.00, image_url="/images/shiozakura-collins.png",
                    category="Cocktails", stock=10,
                    alcohol_type="Gin", flavor_profile="Refreshing",
                    difficulty="Easy", occasion="Casual"),
            # ── Kits ───────────────────────────────────────────────────────────
            Product(name="Shima Fizzy Kit",
                    description="Mezcal, Dashi, Watermelon Soda — serves 2",
                    price=75.00, image_url="/images/shima-fizzy.png",
                    category="Kits", stock=8,
                    alcohol_type="Mezcal", flavor_profile="Fizzy & Experimental",
                    difficulty="Medium", occasion="Party"),
            Product(name="Mojito Starter Kit",
                    description="White Rum, Fresh Mint, Lime, Cane Sugar, Soda Water — serves 4",
                    price=65.00, image_url="/images/mojito-kit.png",
                    category="Kits", stock=12,
                    alcohol_type="Rum", flavor_profile="Fresh & Citrus",
                    difficulty="Easy", occasion="Party"),
            Product(name="Classic Margarita Kit",
                    description="Blanco Tequila, Triple Sec, Fresh Lime, Salt — serves 4",
                    price=70.00, image_url="/images/margarita-kit.png",
                    category="Kits", stock=10,
                    alcohol_type="Tequila", flavor_profile="Sour & Bright",
                    difficulty="Easy", occasion="Party"),
            # ── Glassware ──────────────────────────────────────────────────────
            Product(name="Coupe Glass Set",
                    description="Handblown crystal coupe, set of 4. Ideal for cocktails and champagne.",
                    price=85.00, image_url="/images/coupe-glass.png",
                    category="Glassware", stock=15),
            Product(name="Highball Glass Set",
                    description="Clear crystal highball, set of 4. Perfect for long cocktails and fizzy drinks.",
                    price=72.00, image_url="/images/highball-glass.png",
                    category="Glassware", stock=15),
            Product(name="Crystal Rocks Glass",
                    description="Heavy-base crystal rocks glass, set of 2. Designed for whiskey and spirit pours.",
                    price=68.00, image_url="/images/rocks-glass.png",
                    category="Glassware", stock=20),
            # ── Bar Tools ──────────────────────────────────────────────────────
            Product(name="Cocktail Shaker Set",
                    description="3-piece stainless steel shaker with built-in strainer and measuring cap.",
                    price=55.00, image_url="/images/shaker-set.png",
                    category="Bar Tools", stock=20),
            Product(name="Precision Jigger",
                    description="Double-sided stainless steel jigger, 30ml / 60ml. Calibrated for accuracy.",
                    price=28.00, image_url="/images/jigger-set.png",
                    category="Bar Tools", stock=25),
        ]

        session.add_all(products)
        session.commit()
        return {"message": f"Seeded {len(products)} products successfully"}