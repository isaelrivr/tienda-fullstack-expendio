# 🛒 Tienda Fullstack - Expendio

Aplicación web fullstack para la gestión de una tienda tipo expendio. Permite visualizar productos desde una tienda pública y administrarlos desde un panel de administrador.

---

## 🚀 Tecnologías utilizadas

* ⚙️ Backend: Node.js + Express.js
* 🗄️ Base de datos: MySQL
* 🎨 Frontend: HTML, CSS, JavaScript
* 🐳 Contenedores: Docker

---

## 📁 Estructura del proyecto

```
controllers/     # Lógica de la aplicación
models/          # Acceso a la base de datos
routes/          # Definición de rutas (API)
public/          
   ├── tienda/   # Interfaz del cliente
   └── admin/    # Panel de administración
config/          # Configuración (BD, variables)
docker-compose.yml
Dockerfile
package.json
README.md
```

---

## 🧠 Arquitectura

El proyecto sigue una estructura basada en el patrón **MVC (Modelo - Vista - Controlador)**:

* **Modelos:** Manejan la interacción con la base de datos
* **Controladores:** Procesan la lógica del negocio
* **Rutas:** Definen los endpoints de la API
* **Vistas:** Interfaces en la carpeta `/public`

⚠️ Nota: Actualmente el patrón MVC está implementado de forma básica y puede mejorarse separando completamente la lógica de negocio.

---

## 🌐 Funcionalidades

### 🛍️ Tienda (cliente)

* Visualización de productos
* Interfaz pública accesible

### ⚙️ Panel de administrador

* Gestión de productos (CRUD)
* Interfaz separada de la tienda

---

## 🔐 Seguridad (pendiente de mejora)

Actualmente el sistema:

* ❌ No cuenta con autenticación
* ❌ No tiene control de roles (admin/usuario)

👉 Recomendación: implementar login y middleware de autorización.

---

## ⚙️ Instalación y ejecución

### 🔹 Opción 1: Ejecutar localmente

1. Clonar repositorio:

```
git clone https://github.com/isaelrivr/tienda-fullstack-expendio.git
cd tu-repo
```

2. Instalar dependencias:

```
npm install
```

3. Configurar base de datos:

* Importar archivo `.sql`
* Configurar credenciales en el archivo de conexión

4. Ejecutar servidor:

```
npm start
```

---

### 🐳 Opción 2: Ejecutar con Docker

```
docker-compose up --build
```

---

## 📡 Endpoints principales

```
GET     /productos
POST    /productos
PUT     /productos/:id
DELETE  /productos/:id
```

---

## 📌 Mejoras futuras

* 🔐 Sistema de autenticación (login)
* 👥 Control de roles (admin / cliente)
* 🧩 Separación completa de MVC
* 📦 API REST estructurada (/api/v1)
* 🛡️ Validaciones y seguridad (SQL Injection, JWT)
* 🎨 Mejora de interfaz de usuario

---

## ⭐ Notas

Este proyecto fue desarrollado con fines educativos para comprender el funcionamiento de aplicaciones fullstack, arquitectura MVC y despliegue con Docker.
