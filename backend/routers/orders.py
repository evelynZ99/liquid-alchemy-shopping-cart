from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from db import engine
from deps import require_admin
from models import Order, OrderItem, Product, User
from sqlmodel import SQLModel

router = APIRouter(prefix="/orders", tags=["Orders"])


class OrderItemInput(SQLModel):
    product_id: int
    quantity: int


class OrderCreate(SQLModel):
    user_id: int
    items: List[OrderItemInput]


class OrderItemPublic(SQLModel):
    product_id: int
    quantity: int
    price_at_purchase: float
    name: str


class OrderPublic(SQLModel):
    id: int
    user_id: int
    total_price: float
    status: str
    created_at: str
    items: List[OrderItemPublic]


@router.post("/")
def create_order(order_in: OrderCreate):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order must include items")

    with Session(engine) as session:
        user = session.get(User, order_in.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        total_price = 0.0
        order_items = []

        for item in order_in.items:
            product = session.get(Product, item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            price = product.price
            total_price += price * item.quantity
            order_items.append((product, price, item.quantity))

        order = Order(user_id=order_in.user_id, total_price=total_price)
        session.add(order)
        session.commit()
        session.refresh(order)

        for product, price, quantity in order_items:
            session.add(
                OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=quantity,
                    price_at_purchase=price,
                )
            )

        session.commit()
        return {"message": "Order created", "order_id": order.id}


@router.get("/{order_id}")
def get_order(order_id: int):
    with Session(engine) as session:
        order = session.get(Order, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        items = session.exec(
            select(OrderItem).where(OrderItem.order_id == order.id)
        ).all()
        result_items = []
        for item in items:
            product = session.get(Product, item.product_id)
            result_items.append(
                {
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "price_at_purchase": item.price_at_purchase,
                    "name": product.name if product else "",
                }
            )

        return {
            "id": order.id,
            "user_id": order.user_id,
            "total_price": order.total_price,
            "status": order.status,
            "created_at": order.created_at.isoformat(),
            "items": result_items,
        }


@router.get("/user/{user_id}")
def get_user_orders(user_id: int):
    with Session(engine) as session:
        orders = session.exec(select(Order).where(Order.user_id == user_id)).all()
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