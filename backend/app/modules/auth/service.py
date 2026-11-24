from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# auth no tiene modelo propio, usa Usuario
class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            # username y email no se pueden repetir -> 409
            if uow.usuarios.get_by_username(data.username):
                raise HTTPException(status.HTTP_409_CONFLICT, "El nombre de usuario ya está en uso")
            if uow.usuarios.get_by_email(data.email):
                raise HTTPException(status.HTTP_409_CONFLICT, "El email ya está registrado")

            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email,
                hashed_password=hash_password(data.password),
                role="user",  # el registro siempre crea clientes
            )
            return UserPublic.model_validate(uow.usuarios.add(usuario))

    def autenticar(self, username: str, password: str) -> str:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED,
                    "Usuario o contraseña incorrectos",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if usuario.disabled:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
            # devuelve el token, el router lo pone en la cookie
            return create_access_token({"sub": usuario.username, "role": usuario.role})
