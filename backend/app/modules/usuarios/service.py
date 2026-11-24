from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork



class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_ordenados()]

    def cambiar_estado(self, usuario_id: int, disabled: bool, admin_id: int) -> UserPublic:
        # el admin no se puede desactivar a sí mismo
        if disabled and usuario_id == admin_id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "No podés desactivar tu propia cuenta")
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
            # está en la sesión, se guarda solo en el commit
            usuario.disabled = disabled
            return UserPublic.model_validate(usuario)
