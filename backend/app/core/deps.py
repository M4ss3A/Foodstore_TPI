from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# saca el token de la cookie 
class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get("access_token")
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No autenticado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


# valida el token y busca el usuario -> 401 si falla
def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserPublic:
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o sesión vencida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credenciales_invalidas
    username = payload.get("sub")
    if not username:
        raise credenciales_invalidas

    with UsuarioUnitOfWork(session_factory) as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise credenciales_invalidas
        return UserPublic.model_validate(usuario)


CurrentUser = Annotated[UserPublic, Depends(get_current_user)]


# rechaza cuentas desactivadas -> 400
def get_current_active_user(current_user: CurrentUser) -> UserPublic:
    if current_user.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
    return current_user


ActiveUser = Annotated[UserPublic, Depends(get_current_active_user)]


# chequea el rol -> 403 si no tiene permiso
def require_role(allowed_roles: list[str]):
    def role_checker(current_user: ActiveUser) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tenés permisos para realizar esta acción")
        return current_user

    return role_checker


AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
