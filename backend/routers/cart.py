from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from db import engine
from models import CartItem, Product, User
from deps import require_admin

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("/")
def get_cart(user_id: int):
    with Session(engine) as session:
        cart_items = session.exec(
            select(CartItem).where(CartItem.user_id == user_id)
        ).all()

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


@router.get("/all")
def get_all_carts(admin_user: User = Depends(require_admin)):
    with Session(engine) as session:
        cart_items = session.exec(select(CartItem)).all()
        users = session.exec(select(User)).all()
        products = session.exec(select(Product)).all()
        user_map = {user.id: user for user in users}
        product_map = {product.id: product for product in products}

        grouped = {}
        for item in cart_items:
            user = user_map.get(item.user_id)
            product = product_map.get(item.product_id)
            if not user or not product:
                continue
            entry = grouped.setdefault(
                user.id,
                {
                    "user_id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "items": [],
                    "total": 0,
                },
            )
            subtotal = product.price * item.quantity
            entry["items"].append(
                {
                    "cart_item_id": item.id,
                    "product_id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "image_url": product.image_url,
                    "quantity": item.quantity,
                    "subtotal": subtotal,
                }
            )
            entry["total"] += subtotal

        return list(grouped.values())


@router.post("/")
def add_to_cart(user_id: int, product_id: int, quantity: int = 1):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        existing_cart_item = session.exec(
            select(CartItem).where(
                CartItem.product_id == product_id,
                CartItem.user_id == user_id,
            )
        ).first()

        if existing_cart_item:
            existing_cart_item.quantity += quantity
            session.add(existing_cart_item)
            session.commit()
            session.refresh(existing_cart_item)
            return {"message": "Cart item updated", "cart_item_id": existing_cart_item.id}

        new_cart_item = CartItem(
            user_id=user_id,
            product_id=product_id,
            quantity=quantity,
        )
        session.add(new_cart_item)
        session.commit()
        session.refresh(new_cart_item)
        return {"message": "Item added to cart", "cart_item_id": new_cart_item.id}


@router.put("/{cart_item_id}")
def update_cart_item(cart_item_id: int, quantity: int, user_id: int):
    with Session(engine) as session:
        cart_item = session.get(CartItem, cart_item_id)
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        if cart_item.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not allowed")

        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

        cart_item.quantity = quantity
        session.add(cart_item)
        session.commit()
        session.refresh(cart_item)
        return {"message": "Cart item updated successfully"}


@router.delete("/{cart_item_id}")
def delete_cart_item(cart_item_id: int, user_id: int):
    with Session(engine) as session:
        cart_item = session.get(CartItem, cart_item_id)
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")

        if cart_item.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not allowed")

        session.delete(cart_item)
        session.commit()
        return {"message": "Cart item deleted successfully"}


@router.delete("/")
def clear_cart(user_id: int):
    with Session(engine) as session:
        cart_items = session.exec(
            select(CartItem).where(CartItem.user_id == user_id)
        ).all()
        for item in cart_items:
            session.delete(item)
        session.commit()
        return {"message": "Cart cleared successfully"}