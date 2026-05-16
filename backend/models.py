from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


# ==================== User Models ====================

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(max_length=255)
    email: str = Field(max_length=255)
    password_hash: str = Field(max_length=255)
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(SQLModel):
    username: str
    email: str
    password: str
    is_admin: bool = False
    admin_key: Optional[str] = None


class UserLogin(SQLModel):
    email: str
    password: str


class UserPublic(SQLModel):
    id: int
    username: str
    email: str
    password_hash: str
    is_admin: bool
    created_at: datetime


class UserRoleUpdate(SQLModel):
    is_admin: bool

class UserPasswordUpdate(SQLModel):
    current_password: str
    new_password: str


# ==================== Product Models ====================

class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    description: str
    price: float
    image_url: str = Field(max_length=255)
    category: str = Field(max_length=255)
    stock: int = 0
    alcohol_type: Optional[str] = Field(default=None, max_length=100)
    flavor_profile: Optional[str] = Field(default=None, max_length=100)
    difficulty: Optional[str] = Field(default=None, max_length=50)
    occasion: Optional[str] = Field(default=None, max_length=100)


class ProductCreate(SQLModel):
    name: str
    description: str
    price: float
    image_url: str
    category: str
    stock: int = 0
    alcohol_type: Optional[str] = None
    flavor_profile: Optional[str] = None
    difficulty: Optional[str] = None
    occasion: Optional[str] = None


class ProductUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    alcohol_type: Optional[str] = None
    flavor_profile: Optional[str] = None
    difficulty: Optional[str] = None
    occasion: Optional[str] = None


# ==================== Cart Models ====================

class CartItem(SQLModel, table=True):
    __tablename__ = "cart_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    product_id: int = Field(foreign_key="products.id")
    quantity: int = 1


# ==================== Wishlist Models ====================

class WishlistItem(SQLModel, table=True):
    __tablename__ = "wishlist_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    product_id: int = Field(foreign_key="products.id")


# ==================== Order Models ====================

class Order(SQLModel, table=True):
    __tablename__ = "orders"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    total_price: float
    status: str = Field(default="pending", max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class OrderItem(SQLModel, table=True):
    __tablename__ = "order_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id")
    product_id: int = Field(foreign_key="products.id")
    quantity: int
    price_at_purchase: float