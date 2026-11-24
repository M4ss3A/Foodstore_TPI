from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=_connect_args)


def create_all_tables() -> None:
    # importo los modelos para que se registren las tablas
    import app.modules.categorias.models  # noqa: F401
    import app.modules.pedidos.models  # noqa: F401
    import app.modules.productos.models  # noqa: F401
    import app.modules.usuarios.models  # noqa: F401
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # el UoW la llama en cada with y obtiene una sesion nueva
    return Session(engine)
