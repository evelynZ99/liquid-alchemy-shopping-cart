from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlmodel import Session
from db import engine, create_db_and_tables
from routers import products, cart, users, orders, wishlist

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


# 注册所有路由
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(wishlist.router)