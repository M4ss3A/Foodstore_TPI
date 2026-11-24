from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

from app.core.database import session_factory
from app.core.deps import AdminUser
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork(session_factory))


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]
CategoriaId = Annotated[int, Path(gt=0)]


# lecturas publicas
@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: CategoriaId, service: ServiceDep):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))


# escrituras solo admin
@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: CategoriaId, data: CategoriaUpdate, _admin: AdminUser, service: ServiceDep
):
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(categoria_id: CategoriaId, _admin: AdminUser, service: ServiceDep):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
