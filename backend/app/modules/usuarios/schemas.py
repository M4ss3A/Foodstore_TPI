from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


# registro: el rol no se recibe, siempre es user
class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)  # bcrypt acepta hasta 72


# salida: nunca se devuelve el hash
class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
