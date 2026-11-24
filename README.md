# Foodstore_TPI
Trabajo Practico Integrador- Programacion IV, UTN

- **Repositorio:** https://github.com/M4ss3A/Foodstore_TPI
- **Video de demostración:**  https://youtu.be/IQGhWs0uwo8

Aplicacion web para un negocio de comidas: los clientes se registran, recorren el catalogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

## 🛠️ Tecnologias utilizadas

| Parte | Tecnologías |
|---|---|
| Backend | Python 3.11–3.13, FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly, bcrypt |
| Frontend | React 19 + TypeScript, Vite 7, Tailwind CSS 4, TanStack Query / Form / Table, React Router 7, Zustand, Axios |

## Requisitos

- **Python 3.11, 3.12 o 3.13** 
- **PostgreSQL 15 o superior** 
- **Node.js 20.19 o superior**
- **pnpm 9 o superior** → si no lo tenes: `npm install -g pnpm`

## 1. Backend

### Crear la base de datos

En PostgreSQL crear una base vacía llamada `foodstore_db` (desde pgAdmin o con `psql -U postgres -c "CREATE DATABASE foodstore_db;"`). Las tablas se crean solas.

### Instalar y ejecutar

```bash
cd backend

# entorno virtual
python -m venv .venv
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt

# variables de entorno: copiar el ejemplo y poner la contraseña de PostgreSQL
# Windows:  copy .env.example .env
# Linux:    cp .env.example .env

# datos iniciales (admin, categorías y productos); se puede correr varias veces
python -m app.db.seed

# levantar la API
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación: http://localhost:8000/docs 

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` (o `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión (token y cookie) | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |


### Usuarios del seed

| Rol | Usuario | Contraseña |
|---|---|---|
| admin | `admin` | `Admin1234!` |
| user (cliente de prueba) | `cliente` | `Cliente1234!` |

## 2. Frontend

En otra terminal, con el backend corriendo:

```bash
cd frontend

# Windows:  copy .env.example .env
# Linux:    cp .env.example .env

pnpm install
pnpm build   # verifica los tipos y compila
pnpm dev
```

Abrir http://localhost:5173

### Variables de entorno (`frontend/.env`)

| Variable | Ejemplo |
|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/v1` |


## Estructura

```
backend/app/
├── main.py              FastAPI, CORS con credenciales y routers bajo /api/v1
├── core/                config, database, security, deps, unit_of_work, base_repository
├── modules/
│   ├── auth/            registro, login (cookie HttpOnly), logout, /me
│   ├── usuarios/        modelo Usuario y gestión por el admin
│   ├── categorias/      CRUD con baja lógica y nombre único
│   ├── productos/       CRUD, stock, baja lógica, listado paginado con búsqueda
│   └── pedidos/         creación transaccional, máquina de estados, cancelación y resumen
└── db/seed.py           datos iniciales (idempotente)

frontend/src/
├── shared/              api (axios, errores, queryClient), ui, components y layout
├── features/            auth, categorias, productos, pedidos, usuarios (pages, components, hooks, api, types)
├── store/               authStore y cartStore (Zustand + persist)
└── routes/              AppRouter y ProtectedRoute
```

Cada módulo del backend sigue la cadena **Router → Service → Unit of Work → Repository → Model**. El commit lo hace solo el `__exit__` del Unit of Work: si una regla falla, se hace rollback y no se guarda nada.

## Reglas de negocio principales

- **RN-01:** el pedido se crea en una sola transacción: valida productos (existen, activos, disponibles, sin repetir, con stock), descuenta stock y copia nombre y precio en cada línea.
- **RN-02:** estados `PENDIENTE → EN_PREPARACION → ENTREGADO`, y `CANCELADO` desde los dos primeros. Una transición inválida responde 400.
- **RN-03:** al cancelar se devuelve el stock en la misma transacción.
- **RN-04:** el cliente ve y cancela solo sus pedidos (y solo en `PENDIENTE`); el admin ve y gestiona todos.
- **RN-05:** las líneas y el total no cambian después de creado el pedido; los pedidos no se borran.
- **RN-06:** forma de pago `EFECTIVO` o `TRANSFERENCIA`; dirección de 5 a 200 caracteres.