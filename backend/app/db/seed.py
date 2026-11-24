"""
Carga datos iniciales: admin, un cliente de prueba, categorias y productos.
Es idempotente: si algo ya existe no lo duplica.

Uso (desde backend/):  python -m app.db.seed
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401 (registra las tablas)
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    {"username": "admin", "full_name": "Administrador", "email": "admin@foodstore.com", "password": "Admin1234!", "role": "admin"},
    {"username": "cliente", "full_name": "Cliente de Prueba", "email": "cliente@foodstore.com", "password": "Cliente1234!", "role": "user"},
]

CATEGORIAS = [
    {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra"},
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas caseras con papas"},
    {"nombre": "Empanadas", "descripcion": "Empanadas al horno"},
    {"nombre": "Bebidas", "descripcion": "Gaseosas, aguas y cervezas"},
    {"nombre": "Postres", "descripcion": "Postres y helados"},
]


def img(texto: str) -> str:
    # imagen de ejemplo con el nombre del producto
    return f"https://placehold.co/400x300/f97316/ffffff?text={texto.replace(' ', '+')}"


PRODUCTOS = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500, 20),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 10800, 15),
    ("Pizzas", "Pizza Fugazzeta", "Cebolla y mucha muzzarella", 11200, 12),
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 8900, 25),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble carne, cheddar y bacon", 11500, 18),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de lentejas y vegetales", 9200, 10),
    ("Empanadas", "Empanada de Carne", "Carne cortada a cuchillo", 1500, 60),
    ("Empanadas", "Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1400, 60),
    ("Empanadas", "Empanada de Humita", "Choclo cremoso", 1400, 40),
    ("Bebidas", "Gaseosa 500 ml", "Cola, lima-limón o naranja", 2200, 50),
    ("Bebidas", "Agua sin gas 500 ml", "Agua mineral", 1500, 50),
    ("Bebidas", "Cerveza artesanal 473 ml", "IPA o rubia", 3500, 30),
    ("Postres", "Flan con dulce de leche", "Flan casero", 3800, 15),
    ("Postres", "Helado 1/4 kg", "Dos gustos a elección", 4500, 20),
]


def seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        # usuarios
        for u in USUARIOS:
            existe = session.exec(select(Usuario).where(Usuario.username == u["username"])).first()
            if existe is None:
                session.add(
                    Usuario(
                        username=u["username"],
                        full_name=u["full_name"],
                        email=u["email"],
                        hashed_password=hash_password(u["password"]),
                        role=u["role"],
                    )
                )
                print(f"  + usuario {u['username']}")

        # categorías
        categorias: dict[str, Categoria] = {}
        for c in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == c["nombre"])).first()
            if categoria is None:
                categoria = Categoria(**c)
                session.add(categoria)
                session.flush()
                print(f"  + categoría {c['nombre']}")
            categorias[c["nombre"]] = categoria

        # productos
        for nombre_cat, nombre, descripcion, precio, stock in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(
                    Producto(
                        categoria_id=categorias[nombre_cat].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=img(nombre),
                        stock=stock,
                    )
                )
                print(f"  + producto {nombre}")

        session.commit()
    print("Seed listo. Admin: admin / Admin1234!  -  Cliente: cliente / Cliente1234!")


if __name__ == "__main__":
    seed()
