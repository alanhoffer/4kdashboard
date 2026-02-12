# API Completa - Documentación para Frontend

## Base URL
```
https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io
```

## Autenticación
La mayoría de endpoints requieren autenticación Bearer Token:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Autenticación (`/auth`)

### POST `/auth/login`
Inicia sesión y obtiene tokens de acceso.

**Request Body:**
```json
{
  "email": "admin@cliente.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Ejemplo cURL:**
```bash
curl -X POST "https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cliente.com", "password": "password123"}'
```

---

### POST `/auth/refresh`
Renueva el token de acceso usando el refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### GET `/auth/me`
Obtiene información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "user_id": "uuid-del-usuario",
  "email": "admin@cliente.com",
  "client_id": 7,
  "client_name": "NIBOL",
  "dealer_name": "NIBOL",
  "role": "admin",
  "global_role": "user"
}
```

**Roles posibles:**
- `global_role`: `"superadmin"` | `"user"`
- `role`: `"admin"` | `"user"`

---

### GET `/auth/apps`
Obtiene las aplicaciones disponibles para el usuario actual.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "user_id": "uuid-del-usuario",
  "email": "admin@cliente.com",
  "client_id": "7",
  "global_role": "user",
  "available_apps": [
    {
      "application_id": "1",
      "name": "ERP",
      "description": "Sistema ERP",
      "role": "user",
      "access_granted": true
    },
    {
      "application_id": "2",
      "name": "RPM",
      "description": "Sistema RPM",
      "role": "user",
      "access_granted": true
    }
  ],
  "total_apps": 2
}
```

---

### POST `/auth/create_superadmin`
Crea un usuario superadmin (sin autenticación requerida - solo para setup inicial).

**Request Body:**
```json
{
  "email": "superadmin@4k.com",
  "password": "SuperSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "superadmin_id": "uuid-generado",
  "superadmin_email": "superadmin@4k.com"
}
```

---

### POST `/auth/create_client`
Crea un nuevo cliente (solo Superadmin).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "id": 8,
  "name": "Nuevo Cliente",
  "contact_email": "contacto@nuevocliente.com"
}
```

**Response (200 OK):**
```json
{
  "client_id": 8,
  "name": "Nuevo Cliente",
  "contact_email": "contacto@nuevocliente.com",
  "created_by": "superadmin@4k.com",
  "erp_permissions": "granted",
  "message": "Cliente Nuevo Cliente creado exitosamente con permisos ERP"
}
```

---

### POST `/auth/create_client_user`
Crea un usuario para un cliente específico.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permisos:**
- Superadmin: Puede crear usuarios para cualquier cliente
- Admin de Cliente: Solo puede crear usuarios para su propio cliente

**Request Body:**
```json
{
  "email": "usuario@cliente.com",
  "password": "Password123!",
  "client_id": "7",
  "role": "admin"
}
```

**Response (200 OK):**
```json
{
  "user_id": "uuid-generado",
  "email": "usuario@cliente.com",
  "client_id": "7",
  "role": "admin",
  "client_name": "NIBOL",
  "created_by": "superadmin@4k.com",
  "permissions": "superadmin"
}
```

---

## 👥 Gestión de Usuarios (`/users`)

### GET `/users`
Lista usuarios según permisos del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `client_id` (opcional): Filtrar por cliente (solo superadmin)

**Ejemplos:**
```bash
# Superadmin - Ver todos
GET /users

# Superadmin - Filtrar por cliente
GET /users?client_id=7

# Admin de Cliente - Solo ve su cliente
GET /users
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "email": "admin@cliente.com",
    "client_id": 7,
    "client_name": "NIBOL",
    "role": "admin",
    "global_role": "user",
    "created_at": "2025-02-04T10:00:00"
  },
  {
    "id": "uuid-2",
    "email": "usuario@cliente.com",
    "client_id": 7,
    "client_name": "NIBOL",
    "role": "user",
    "global_role": "user",
    "created_at": "2025-02-04T11:00:00"
  }
]
```

---

### DELETE `/users/{user_id}`
Elimina un usuario.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permisos:**
- Superadmin: Puede eliminar cualquier usuario
- Admin de Cliente: Solo puede eliminar usuarios de su cliente

**Response (200 OK):**
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

---

## 🏢 Gestión de Clientes (`/clients`)

### GET `/clients`
Obtiene la lista de clientes disponibles para el usuario actual.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response - Superadmin (200 OK):**
```json
{
  "user_role": "superadmin",
  "available_clients": [
    {
      "client_id": 1,
      "name": "Cliente 1",
      "dealer_id": "DEALER_001",
      "server": "rg-sql-server-br.database.windows.net",
      "database": "rg-sql-db"
    },
    {
      "client_id": 7,
      "name": "NIBOL",
      "dealer_id": "DEALER_007",
      "server": "rg-sql-server-br.database.windows.net",
      "database": "rg-sql-db"
    }
  ],
  "total_clients": 2
}
```

**Response - Usuario Normal (200 OK):**
```json
{
  "user_role": "client_user",
  "client_id": 7,
  "name": "NIBOL",
  "dealer_id": "DEALER_007",
  "server": "rg-sql-server-br.database.windows.net",
  "database": "rg-sql-db"
}
```

---

### GET `/clients/{client_id}`
Obtiene detalles de un cliente específico.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "client_id": 7,
  "name": "NIBOL",
  "dealer_id": "DEALER_007",
  "server": "rg-sql-server-br.database.windows.net",
  "database": "rg-sql-db",
  "status": "active"
}
```

---

### GET `/clients/{client_id}/users`
Obtiene los usuarios de un cliente específico.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "email": "admin@nibol.com",
    "client_id": 7,
    "client_name": "NIBOL",
    "role": "admin",
    "global_role": "user",
    "created_at": "2025-02-04T10:00:00"
  }
]
```

---

### GET `/clients/{client_id}/apps`
Obtiene las aplicaciones asignadas a un cliente.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "client_id": 7,
    "application_id": 1,
    "app_name": "ERP",
    "status": "active",
    "created_at": "2025-02-04T10:00:00"
  },
  {
    "client_id": 7,
    "application_id": 2,
    "app_name": "RPM",
    "status": "active",
    "created_at": "2025-02-04T10:00:00"
  }
]
```

---

### POST `/clients/{client_id}/apps`
Asigna una aplicación a un cliente (Solo Superadmin).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "client_id": 7,
  "application_id": 3,
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "client_id": 7,
  "application_id": 3,
  "app_name": "SEEDZ",
  "status": "active",
  "created_at": "2025-02-04T12:00:00"
}
```

---

### DELETE `/clients/{client_id}/apps/{app_id}`
Remueve una aplicación de un cliente (Solo Superadmin).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Aplicación removida exitosamente"
}
```

---

## 📱 Gestión de Aplicaciones (`/apps`)

### GET `/apps`
Lista todas las aplicaciones del sistema (Solo Superadmin).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "ERP",
    "description": "Sistema ERP",
    "created_at": "2025-01-01T00:00:00"
  },
  {
    "id": 2,
    "name": "RPM",
    "description": "Sistema RPM",
    "created_at": "2025-01-01T00:00:00"
  },
  {
    "id": 3,
    "name": "SEEDZ",
    "description": "Integración con Seedz",
    "created_at": "2025-01-15T00:00:00"
  }
]
```

---

### POST `/apps`
Crea una nueva aplicación (Solo Superadmin).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "NUEVA_APP",
  "description": "Descripción de la nueva aplicación"
}
```

**Response (200 OK):**
```json
{
  "id": 4,
  "name": "NUEVA_APP",
  "description": "Descripción de la nueva aplicación",
  "created_at": "2025-02-04T12:00:00"
}
```

---

## 📦 Órdenes y Transferencias

### POST `/rpm/orders`
Sube y procesa un archivo de órdenes (ORD).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file): Archivo ORD a procesar (.dat, .txt, .ord)
- `target_client_id` (opcional, int): ID del cliente objetivo (solo superadmin)

**Nota:** 
- Superadmin DEBE especificar `target_client_id`
- Usuario normal usa su propio `client_id` automáticamente

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully processed orders file",
  "file_type": "orders",
  "filename": "orders_345923.dat",
  "client_id": 7,
  "dealer_name": "NIBOL",
  "rows_processed": 150,
  "rows_inserted": 150,
  "processed_by": "admin@nibol.com",
  "processed_at": "2025-02-04T12:30:00Z",
  "endpoint_used": "/erp/rpm/orders"
}
```

**Ejemplo cURL:**
```bash
curl -X POST "https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io/rpm/orders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@orders_345923.dat" \
  -F "target_client_id=7"
```

---

### POST `/rpm/transfers`
Sube y procesa un archivo de transferencias (TRF).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file): Archivo TRF a procesar (.dat, .txt, .trf)
- `target_client_id` (opcional, int): ID del cliente objetivo (solo superadmin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully processed transfers file",
  "file_type": "transfers",
  "filename": "transfers_456789.dat",
  "client_id": 7,
  "dealer_name": "NIBOL",
  "rows_processed": 75,
  "rows_inserted": 75,
  "processed_by": "admin@nibol.com",
  "processed_at": "2025-02-04T12:35:00Z",
  "endpoint_used": "/erp/rpm/transfers"
}
```

---

## 📊 Consultar Órdenes y Transferencias Estructuradas (`/prism`)

### GET `/prism/orders`
Obtiene la lista de cabeceras de órdenes del cliente autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "client_id": 7,
    "order_id": "345923",
    "order_date": "2025-02-04T10:30:00",
    "created_at": "2025-02-04T10:35:00",
    "processed": false,
    "is_sent_pd": false
  },
  {
    "id": 2,
    "client_id": 7,
    "order_id": "345924",
    "order_date": "2025-02-04T11:00:00",
    "created_at": "2025-02-04T11:05:00",
    "processed": true,
    "is_sent_pd": false
  }
]
```

---

### GET `/prism/orders/{header_id}/items`
Obtiene todos los ítems de una orden específica.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "header_id": 1,
    "dealer_account": "DEALER001",
    "dbs_warehouse": "WH001",
    "order_activity": "ACTIVE",
    "order_time": "10:30:00",
    "order_type": "STANDARD",
    "order_source": "WEB",
    "order_line_id": "LINE001",
    "part_number": "PART123",
    "order_quantity": 10.0,
    "order_reference_id": "REF001",
    "special_program_number": null,
    "requested_ship_date": "2025-02-10",
    "line_activity": "PENDING",
    "processed": false
  }
]
```

---

### GET `/prism/transfers`
Obtiene la lista de cabeceras de transferencias del cliente autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "client_id": 7,
    "transfer_id": "456789",
    "order_date": "2025-02-04T14:00:00",
    "created_at": "2025-02-04T14:05:00",
    "processed": false,
    "is_sent_pd": false
  }
]
```

---

### GET `/prism/transfers/{header_id}/items`
Obtiene todos los ítems de una transferencia específica.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "header_id": 1,
    "order_time": "14:00:00",
    "from_dealer_account": "DEALER001",
    "from_warehouse": "WH001",
    "to_dealer_account": "DEALER002",
    "to_warehouse": "WH002",
    "part_number": "PART789",
    "transfer_quantity": 20.0,
    "processed": false
  }
]
```

---

## 🔄 Flujo Recomendado para Frontend

### 1. **Login y Autenticación**
```javascript
// 1. Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { access_token, refresh_token } = await loginResponse.json();

// 2. Guardar tokens
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);

// 3. Obtener info del usuario
const userInfo = await fetch('/auth/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const user = await userInfo.json();
```

### 2. **Dashboard Superadmin**
```javascript
// Listar todos los clientes
const clients = await fetch('/clients', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

// Listar todas las aplicaciones
const apps = await fetch('/apps', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});

// Listar todos los usuarios
const users = await fetch('/users', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

### 3. **Crear Cliente y Usuario Admin**
```javascript
// 1. Crear cliente
const newClient = await fetch('/auth/create_client', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: 8,
    name: "Nuevo Cliente",
    contact_email: "contacto@cliente.com"
  })
});

// 2. Crear usuario admin para ese cliente
const adminUser = await fetch('/auth/create_client_user', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: "admin@nuevocliente.com",
    password: "Password123!",
    client_id: "8",
    role: "admin"
  })
});
```

### 4. **Subir Archivos de Órdenes/Transferencias**
```javascript
// Subir archivo ORD
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('target_client_id', '7'); // Solo si eres superadmin

const result = await fetch('/rpm/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`
  },
  body: formData
});

// Subir archivo TRF
const formData2 = new FormData();
formData2.append('file', fileInput.files[0]);
formData2.append('target_client_id', '7');

const result2 = await fetch('/rpm/transfers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`
  },
  body: formData2
});
```

### 5. **Visualizar Órdenes y Transferencias**
```javascript
// Obtener lista de órdenes
const orders = await fetch('/prism/orders', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const ordersList = await orders.json();

// Para cada orden, obtener sus items
for (const order of ordersList) {
  const items = await fetch(`/prism/orders/${order.id}/items`, {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  order.items = await items.json();
}
```

---

## ⚠️ Códigos de Estado HTTP

- `200 OK` - Solicitud exitosa
- `400 Bad Request` - Datos inválidos en el request
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - Sin permisos para realizar la acción
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

---

## 🔑 Permisos y Roles

### Superadmin (`global_role: "superadmin"`)
- ✅ Crear clientes
- ✅ Crear usuarios para cualquier cliente
- ✅ Ver todos los clientes
- ✅ Ver todos los usuarios
- ✅ Gestionar aplicaciones
- ✅ Asignar aplicaciones a clientes
- ✅ Subir archivos para cualquier cliente (debe especificar `target_client_id`)

### Admin de Cliente (`role: "admin"`, `global_role: "user"`)
- ✅ Crear usuarios para su propio cliente
- ✅ Ver usuarios de su cliente
- ✅ Ver aplicaciones de su cliente
- ✅ Subir archivos para su cliente (no necesita `target_client_id`)

### Usuario Normal (`role: "user"`, `global_role: "user"`)
- ✅ Ver información de su cliente
- ✅ Ver sus propias aplicaciones
- ✅ Subir archivos para su cliente

---

## 📝 Notas Importantes

1. **Tokens**: Los tokens de acceso expiran en 5 minutos (configurable). Usa el refresh token para renovarlos.

2. **Filtrado Automático**: Los endpoints filtran automáticamente por `client_id` del usuario autenticado. No puedes ver datos de otros clientes (a menos que seas superadmin).

3. **Archivos**: Los archivos ORD/TRF deben seguir el formato específico:
   - Primera línea: `ORDER\t<ID>` o `TRNSFR\t<ID>`
   - Líneas siguientes: Datos separados por tabulaciones

4. **Superadmin y target_client_id**: Cuando un superadmin sube archivos, DEBE especificar `target_client_id` en el FormData.

5. **Estructura de Datos**: Los datos se guardan en dos estructuras:
   - **Nueva (PRISM)**: Header/Items relacional (`/prism/orders`, `/prism/transfers`)
   - **Legacy**: Tablas planas (mantiene compatibilidad)
