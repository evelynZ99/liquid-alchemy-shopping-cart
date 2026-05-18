import os
import smtplib
from datetime import date
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from db import engine
from models import User, UserCreate, UserLogin, UserPublic, UserUpdate, UserRoleUpdate, UserPasswordUpdate, CartItem, WishlistItem, Order, OrderItem
from security import hash_password, verify_password
from deps import require_admin


def send_password_reset_email(to_email: str, username: str, new_password: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", smtp_user)

    if not all([smtp_host, smtp_user, smtp_password]):
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your Liquid Alchemy password has been reset"
    msg["From"] = smtp_from
    msg["To"] = to_email

    body = f"""Hi {username},

An administrator has reset your Liquid Alchemy account password.

Your new temporary password is: {new_password}

Please log in and change your password as soon as possible.

— The Liquid Alchemy Team
"""
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_from, to_email, msg.as_string())
        return True
    except Exception:
        return False


def calculate_age(dob: date) -> int:
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

router = APIRouter(prefix="/users", tags=["Users"])


def can_assign_admin(session: Session, admin_key: str | None) -> bool:
    admin_key_env = os.getenv("ADMIN_KEY")
    if admin_key_env:
        return admin_key == admin_key_env
    existing_admin = session.exec(select(User).where(User.is_admin == True)).first()
    return existing_admin is None


@router.post("/register", response_model=UserPublic)
def register(user_in: UserCreate):
    if calculate_age(user_in.date_of_birth) < 21:
        raise HTTPException(status_code=400, detail="You must be 21 or older to register")

    with Session(engine) as session:
        existing = session.exec(select(User).where(User.email == user_in.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        is_admin = False
        if user_in.is_admin and can_assign_admin(session, user_in.admin_key):
            is_admin = True

        new_user = User(
            username=user_in.username,
            email=user_in.email,
            password_hash=hash_password(user_in.password),
            is_admin=is_admin,
            date_of_birth=user_in.date_of_birth,
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return UserPublic.model_validate(new_user)


@router.post("/login", response_model=UserPublic)
def login(user_in: UserLogin):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == user_in.email)).first()
        if not user or not verify_password(user_in.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return UserPublic.model_validate(user)


@router.get("/{user_id}", response_model=UserPublic)
def get_user(user_id: int):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserPublic.model_validate(user)

@router.patch("/{user_id}/password", response_model=UserPublic)
def update_user_password(user_id: int, password_update: UserPasswordUpdate):
    with Session(engine) as session:
        user = session.get(User, user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(password_update.current_password, user.password_hash):
            raise HTTPException(status_code=401, detail="Current password is incorrect")

        if len(password_update.new_password) < 6:
            raise HTTPException(
                status_code=400,
                detail="New password must be at least 6 characters"
            )

        user.password_hash = hash_password(password_update.new_password)

        session.add(user)
        session.commit()
        session.refresh(user)

        return UserPublic.model_validate(user)

@router.get("/", response_model=list[UserPublic])
def list_users(admin_user: User = Depends(require_admin)):
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        return [UserPublic.model_validate(user) for user in users]


@router.delete("/{user_id}")
def delete_user(user_id: int, admin_user: User = Depends(require_admin)):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Delete related records in FK-safe order, flushing between steps
        cart_items = session.exec(select(CartItem).where(CartItem.user_id == user_id)).all()
        for item in cart_items:
            session.delete(item)
        session.flush()

        wishlist_items = session.exec(select(WishlistItem).where(WishlistItem.user_id == user_id)).all()
        for item in wishlist_items:
            session.delete(item)
        session.flush()

        orders = session.exec(select(Order).where(Order.user_id == user_id)).all()
        for order in orders:
            order_items = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
            for oi in order_items:
                session.delete(oi)
            session.flush()
            session.delete(order)
        session.flush()

        session.delete(user)
        session.commit()
        return {"message": "User deleted"}


@router.patch("/{user_id}/profile", response_model=UserPublic)
def update_user_profile(user_id: int, update: UserUpdate):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not update.username.strip():
            raise HTTPException(status_code=400, detail="Username cannot be empty")
        user.username = update.username.strip()
        if update.date_of_birth is not None:
            user.date_of_birth = update.date_of_birth
        session.add(user)
        session.commit()
        session.refresh(user)
        return UserPublic.model_validate(user)


@router.post("/{user_id}/reset-password")
def admin_reset_password(user_id: int, admin_user: User = Depends(require_admin)):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not user.date_of_birth:
            raise HTTPException(status_code=400, detail="User has no date of birth on record")

        new_password = user.date_of_birth.strftime("%Y%m%d")
        user.password_hash = hash_password(new_password)
        session.add(user)
        session.commit()

        email_sent = send_password_reset_email(user.email, user.username, new_password)
        return {"message": "Password reset successfully", "email_sent": email_sent, "default_password": new_password}


@router.patch("/{user_id}/role", response_model=UserPublic)
def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    admin_user: User = Depends(require_admin),
):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.is_admin = role_update.is_admin
        session.add(user)
        session.commit()
        session.refresh(user)
        return UserPublic.model_validate(user)