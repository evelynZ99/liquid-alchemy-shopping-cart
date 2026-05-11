from fastapi import HTTPException, Header, Depends
from sqlmodel import Session
from db import engine
from models import User
from sqlmodel import select


async def require_admin(x_admin_user_id: int = Header(None)) -> User:
    """Dependency to check if user is an admin."""
    if x_admin_user_id is None:
        raise HTTPException(status_code=401, detail="Admin authentication required")
    
    with Session(engine) as session:
        user = session.get(User, x_admin_user_id)
        if not user or not user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        return user
