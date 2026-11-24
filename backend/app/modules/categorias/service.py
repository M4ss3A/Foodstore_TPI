from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


# excepciones de dominio (el router las pasa a HTTP)
class CategoriaNoEncontrada(Exception):
    pass  # 404


class NombreDuplicado(Exception):
    pass  # 409


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    # si esta dada de baja se trata como que no existe
    @staticmethod
    def _buscar_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._buscar_activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre):
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            categoria = Categoria(nombre=data.nombre.strip(), descripcion=data.descripcion)
            return CategoriaRead.model_validate(uow.categorias.add(categoria))

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._buscar_activa(uow, categoria_id)
            # exclude_unset: solo los campos que vinieron en el body
            cambios = data.model_dump(exclude_unset=True)

            nuevo_nombre = cambios.pop("nombre", None)
            if nuevo_nombre is not None:
                existente = uow.categorias.get_by_nombre(nuevo_nombre)
                if existente is not None and existente.id != categoria_id:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")
                categoria.nombre = nuevo_nombre.strip()

            categoria.sqlmodel_update(cambios)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        # baja logica, no toca los productos
        with self.uow as uow:
            categoria = self._buscar_activa(uow, categoria_id)
            categoria.activo = False
