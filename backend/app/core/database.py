"""
Base de datos: engine, creación de tablas y fábrica de sesiones.
"""

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=_connect_args)


def create_all_tables() -> None:
    """Crea las tablas que falten a partir de los modelos con table=True."""
    # Se importan los modelos para que queden registrados en SQLModel.metadata
    import app.modules.usuarios.models  # noqa: F401
    import app.modules.categorias.models  # noqa: F401
    import app.modules.productos.models  # noqa: F401
    import app.modules.pedidos.models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Crea una sesión nueva. La usa el Unit of Work en __enter__.

    expire_on_commit=False: los objetos siguen legibles después del commit.
    """
    return Session(engine, expire_on_commit=False)