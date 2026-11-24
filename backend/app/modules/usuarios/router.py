from typing import Annotated

from fastapi import APIRouter, Depends, Path

from app.core.database import session_factory
from app.core.deps import AdminUser
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork(session_factory))


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]
UsuarioId = Annotated[int, Path(gt=0)]



@router.get("", response_model=list[UserPublic])
def listar_usuarios(_admin: AdminUser, service: ServiceDep):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: UsuarioId, admin: AdminUser, service: ServiceDep):
    return service.cambiar_estado(usuario_id, disabled=False, admin_id=admin.id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: UsuarioId, admin: AdminUser, service: ServiceDep):
    return service.cambiar_estado(usuario_id, disabled=True, admin_id=admin.id)
