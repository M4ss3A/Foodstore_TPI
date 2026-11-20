"""
Unit of Work base

Encapsula una transaccion:
  - __enter__: abre la sesion y crea los repositorios (en las subclases).
  - __exit__: si no hubo excepción hace commit; si la hubo, rollback.
            En los dos casos cierra la sesión.

Ningun Service ni Router llama a session.commit(): el commit ocurre aca

Uso en un Service:
    with self.uow as uow:
        producto = uow.productos.get_by_id(1)
        ...
    # al salir del with: commit (o rollback si se lanzo una excepcion)
"""

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    def __init__(self) -> None:
        self.session: Session | None = None

    def __enter__(self) -> "UnitOfWork":
        self.session = session_factory()
        self._crear_repositorios(self.session)
        return self

    def _crear_repositorios(self, session: Session) -> None:

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        assert self.session is not None
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
