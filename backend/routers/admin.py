from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlmodel import Session, select
from db import engine
from deps import require_admin
from models import CartItem, Order, Product, User

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview")
def get_overview(admin_user: User = Depends(require_admin)):
    with Session(engine) as session:
        total_users = session.exec(select(func.count(User.id))).one()
        total_products = session.exec(select(func.count(Product.id))).one()
        total_orders = session.exec(select(func.count(Order.id))).one()
        total_revenue = session.exec(
            select(func.coalesce(func.sum(Order.total_price), 0))
        ).one()
        cart_items = session.exec(select(func.count(CartItem.id))).one()

        def scalar(value):
            try:
                return value[0]
            except (TypeError, IndexError, KeyError):
                return value

        return {
            "total_users": int(scalar(total_users)),
            "total_products": int(scalar(total_products)),
            "total_orders": int(scalar(total_orders)),
            "total_revenue": float(scalar(total_revenue)),
            "cart_items": int(scalar(cart_items)),
        }
