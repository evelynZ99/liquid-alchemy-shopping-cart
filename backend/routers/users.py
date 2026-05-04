from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select
from db import engine
from models import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register")
def register():
    # TODO: 成员A负责实现
    pass


@router.post("/login")
def login():
    # TODO: 成员A负责实现
    pass


@router.get("/{user_id}")
def get_user(user_id: int):
    # TODO: 成员A负责实现
    pass