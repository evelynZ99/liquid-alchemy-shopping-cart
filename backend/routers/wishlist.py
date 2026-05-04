from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from db import engine
from models import WishlistItem, Product

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("/{user_id}")
def get_wishlist(user_id: int):
    # TODO: 成员C负责实现
    pass


@router.post("/")
def add_to_wishlist():
    # TODO: 成员C负责实现
    pass


@router.delete("/{wishlist_item_id}")
def remove_from_wishlist(wishlist_item_id: int):
    # TODO: 成员C负责实现
    pass