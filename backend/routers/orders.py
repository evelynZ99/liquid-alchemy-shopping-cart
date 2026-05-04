from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from db import engine
from models import Order, OrderItem

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/")
def create_order():
    # TODO: 成员B负责实现
    pass


@router.get("/{order_id}")
def get_order(order_id: int):
    # TODO: 成员B负责实现
    pass


@router.get("/user/{user_id}")
def get_user_orders(user_id: int):
    # TODO: 成员B负责实现
    pass