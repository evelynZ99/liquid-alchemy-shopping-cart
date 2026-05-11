import os
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from db import engine
from models import User, UserCreate, UserLogin, UserPublic, UserRoleUpdate
from security import hash_password, verify_password
from deps import require_admin

router = APIRouter(prefix="/users", tags=["Users"])


def can_assign_admin(session: Session, admin_key: str | None) -> bool:
    admin_key_env = os.getenv("ADMIN_KEY")
    if admin_key_env:
        return admin_key == admin_key_env
    existing_admin = session.exec(select(User).where(User.is_admin == True)).first()
    return existing_admin is None


@router.post("/register", response_model=UserPublic)
def register(user_in: UserCreate):
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
        session.delete(user)
        session.commit()
        return {"message": "User deleted"}


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