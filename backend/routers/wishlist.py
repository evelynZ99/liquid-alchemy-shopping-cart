from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from db import engine
from models import WishlistItem, Product

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("/{user_id}")
def get_wishlist(user_id: int):
    with Session(engine) as session:
        items = session.exec(
            select(WishlistItem).where(WishlistItem.user_id == user_id)
        ).all()

        # 把商品详情一起返回
        result = []
        for item in items:
            product = session.get(Product, item.product_id)
            if product:
                result.append({
                    "id": item.id,
                    "product_id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "image_url": product.image_url,
                    "category": product.category
                })
        return result


@router.post("/")
def add_to_wishlist(user_id: int, product_id: int):
    with Session(engine) as session:
        # 检查商品是否存在
        product = session.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # 检查是否已经在愿望单里，避免重复添加
        existing = session.exec(
            select(WishlistItem).where(
                WishlistItem.user_id == user_id,
                WishlistItem.product_id == product_id
            )
        ).first()

        if existing:
            return existing  # 已存在就直接返回，不重复添加

        item = WishlistItem(user_id=user_id, product_id=product_id)
        session.add(item)
        session.commit()
        session.refresh(item)
        return item


@router.delete("/{wishlist_item_id}")
def remove_from_wishlist(wishlist_item_id: int):
    with Session(engine) as session:
        item = session.get(WishlistItem, wishlist_item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        session.delete(item)
        session.commit()
        return {"message": "Removed from wishlist"}