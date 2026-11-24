from collections.abc import Callable

from sqlmodel import Session


class UnitOfWork:
    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self.session_factory = session_factory

    def __enter__(self) -> "UnitOfWork":
        # abre la sesion y arma los repositorios
        self.session = self.session_factory()
        self._crear_repositorios(self.session)
        return self

    def _crear_repositorios(self, session: Session) -> None:
        pass

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        try:
            # sin error: commit / con error: rollback
            if exc_type:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()
