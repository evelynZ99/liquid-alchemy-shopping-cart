from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select, SQLModel
from db import engine
from deps import require_admin
from models import Order, OrderItem, CartItem, Product, User

router = APIRouter(prefix="/orders", tags=["Orders"])


class OrderItemInput(SQLModel):
    product_id: int
    quantity: int


class OrderCreate(SQLModel):
    user_id: int
    shipping_name: str
    shipping_address: str
    shipping_method: str
    subtotal: float
    shipping_cost: float
    tax: float
    total: float
    items: List[OrderItemInput]


@router.post("/")
def create_order(data: OrderCreate):
    if not data.items:
        raise HTTPException(status_code=400, detail="Order must include items")

    with Session(engine) as session:
        user = session.get(User, data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.is_admin:
            raise HTTPException(status_code=403, detail="Admin accounts cannot place orders")

        for item in data.items:
            product = session.get(Product, item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        order = Order(
            user_id=data.user_id,
            total_price=data.total,
            status="confirmed"
        )
        session.add(order)
        session.commit()
        session.refresh(order)

        for item in data.items:
            product = session.get(Product, item.product_id)
            session.add(OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_purchase=product.price
            ))

        cart_items = session.exec(
            select(CartItem).where(CartItem.user_id == data.user_id)
        ).all()
        for cart_item in cart_items:
            session.delete(cart_item)

        session.commit()

        return {
            "id": order.id,
            "user_id": order.user_id,
            "total_price": order.total_price,
            "status": order.status,
            "shipping_name": data.shipping_name,
            "shipping_address": data.shipping_address,
            "shipping_method": data.shipping_method,
            "subtotal": data.subtotal,
            "shipping_cost": data.shipping_cost,
            "tax": data.tax,
        }


@router.get("/{order_id}")
def get_order(order_id: int):
    with Session(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        user = session.get(User, order.user_id)
        items = session.exec(
            select(OrderItem).where(OrderItem.order_id == order.id)
        ).all()
        result_items = []
        for item in items:
            product = session.get(Product, item.product_id)
            result_items.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase,
                "name": product.name if product else "—",
                "image_url": product.image_url if product else "",
            })

        return {
            "id": order.id,
            "user_id": order.user_id,
            "username": user.username if user else "—",
            "email": user.email if user else "—",
            "total_price": order.total_price,
            "status": order.status,
            "created_at": order.created_at.isoformat(),
            "items": result_items,
        }


@router.get("/user/{user_id}")
def get_user_orders(user_id: int):
    with Session(engine) as session:
        orders = session.exec(
            select(Order).where(Order.user_id == user_id)
        ).all()
        return [
            {
                "id": order.id,
                "user_id": order.user_id,
                "total_price": order.total_price,
                "status": order.status,
                "created_at": order.created_at.isoformat(),
            }
            for order in orders
        ]


@router.get("/")
def get_all_orders(admin_user: User = Depends(require_admin)):
    with Session(engine) as session:
        orders = session.exec(select(Order)).all()
        result = []
        for order in orders:
            user = session.get(User, order.user_id)
            if not user or user.is_admin:
                continue
            result.append({
                "id": order.id,
                "user_id": order.user_id,
                "username": user.username if user else "—",
                "total_price": order.total_price,
                "status": order.status,
                "created_at": order.created_at.isoformat(),
            })
        return result