🍺 ExpendioFS
Sistema de gestión para Expendio de Bebidas — backend REST en Node.js + MySQL con arquitectura MVC, e interfaz web para administración y tienda.

🏗 Arquitectura MVC
El proyecto sigue el patrón Modelo – Vista – Controlador:
CapaCarpetaResponsabilidadModelomodels/Lógica de negocio y acceso a la base de datos (queries SQL)Vistapublic/Archivos estáticos HTML/CSS/JS del panel admin y la tiendaControladorcontrollers/Recibe las peticiones HTTP, llama al modelo y devuelve la respuesta
El flujo es:
Cliente HTTP
    │
    ▼
 Routes  (routes/)
    │
    ▼
 Controller  (controllers/)
    │
    ▼
 Model  (models/)
    │
    ▼
 MySQL (config/db.js)

🗂 Estructura del proyecto
ExpendioFS/
├── config/
│   └── db.js                  # Pool de conexión MySQL
├── controllers/               # ← Controladores (C en MVC)
│   ├── clientesController.js
│   ├── empleadosController.js
│   ├── productosController.js
│   ├── proveedoresController.js
│   ├── sucursalesController.js
│   └── ventasController.js
├── models/                    # ← Modelos (M en MVC)
│   ├── clientes.js
│   ├── empleados.js
│   ├── productos.js
│   ├── proveedores.js
│   ├── sucursales.js
│   └── ventas.js
├── public/                    # ← Vistas (V en MVC)
│   ├── admin/                 # Panel de administración
│   └── tienda/                # Vista de tienda
├── routes/                    # Rutas Express por entidad
├── expendio_bebidas.sql       # Script de inicialización de la BD
├── server.js                  # Punto de entrada
├── dockerfile
└── docker-compose.yml

⚙️ Requisitos

Node.js v20+
MySQL 8.0
(o usa Docker — ver sección abajo)


🚀 Instalación y ejecución
Opción A — Local (sin Docker)
1. Clonar el repositorio
bashgit clone https://github.com/tu-usuario/ExpendioFS.git
cd ExpendioFS
2. Instalar dependencias
bashnpm install
3. Configurar variables de entorno
Crea un archivo .env en la raíz del proyecto:
envDB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=expendio_bebidas
PORT=3000
4. Importar la base de datos
bashmysql -u root -p < expendio_bebidas.sql
5. Arrancar el servidor
bash# Producción
npm start

# Desarrollo (recarga automática con nodemon)
npm run dev

Opción B — Docker Compose (recomendado)
No necesitas instalar Node.js ni MySQL en tu máquina.
1. Clonar el repositorio
bashgit clone https://github.com/tu-usuario/ExpendioFS.git
cd ExpendioFS
2. Levantar los contenedores
bashdocker compose up --build

La app espera automáticamente a que MySQL esté listo antes de arrancar gracias al healthcheck configurado en el compose.

3. Para detener los contenedores
bashdocker compose down
Contenedores que se levantan:
ServicioPuerto localApp Node.js3000MySQL 8.03307

🌐 Acceso
Una vez corriendo (con cualquiera de las dos opciones):
VistaURLRaíz (redirige a admin) http://localhost:3000/
Panel de administración http://localhost:3000/admin/index.html
Tienda http://localhost:3000/tienda/index.html

🔌 API REST
Base URL: http://localhost:3000/api
Todos los endpoints siguen la misma convención CRUD:
MétodoRutaDescripciónGET/:recursoListar todosGET/:recurso/:idObtener por IDPOST/:recursoCrear nuevoPUT/:recurso/:idActualizarDELETE/:recurso/:idEliminar
Recursos disponibles

/api/clientes
/api/empleados
/api/productos
/api/proveedores
/api/sucursales
/api/ventas

Ejemplo — Registrar una venta
bashcurl -X POST http://localhost:3000/api/ventas \
  -H "Content-Type: application/json" \
  -d '{
    "sucursal_id": 1,
    "empleado_id": 2,
    "cliente_id": 3,
    "folio": "V-001",
    "fecha_venta": "2026-05-04",
    "metodo_pago": "Efectivo",
    "subtotal": 150.00
  }'

🛠 Tecnologías
TecnologíaUsoNode.js 20RuntimeExpress 4Framework HTTPMySQL 8 / mysql2Base de datosdotenvVariables de entornocorsPolítica de CORSnodemonRecarga en desarrolloDocker / ComposeContenerización