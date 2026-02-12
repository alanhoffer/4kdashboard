# Guía de Integración Frontend - 4K API

Esta guía te ayudará a construir el frontend para gestionar clientes, usuarios, aplicaciones y procesar archivos de órdenes/transferencias.

## ⚠️ Nota Importante

**Esta guía documenta la API con autenticación** (`https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io`).

Si tu aplicación actual **NO requiere autenticación** y usa una API diferente (como `https://4k.xn--cabaahoffer-4db.com.ar`), puedes:
- **Omitir** las secciones de login/logout y autenticación
- **Usar directamente** los endpoints sin tokens
- **Adaptar** los ejemplos según tu API actual

### Estado Actual del Proyecto

Tu aplicación actualmente tiene:
- ✅ Subida de archivos (`/dtf/upload`) - **YA FUNCIONANDO**
- ✅ Visualización de status de archivos (`/dealers/{id}/logs/{type}`) - **YA FUNCIONANDO**
- ✅ Gestión de dealers/clientes - **YA FUNCIONANDO**
- ❌ **NO tiene login/autenticación implementado**

### ¿Qué necesitas implementar?

**Si tu API actual NO requiere autenticación** (como `https://4k.xn--cabaahoffer-4db.com.ar`):
- **NO necesitas** implementar login/logout
- **NO necesitas** manejar tokens
- Puedes seguir usando tu implementación actual
- Solo necesitas mejorar manejo de errores y UX si es necesario

**Si quieres migrar a la API con autenticación** (`https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io`):
- **SÍ necesitas** implementar login/logout (Flujo 0)
- **SÍ necesitas** manejar tokens y refresh tokens
- **SÍ necesitas** adaptar tus llamadas a la API para incluir autenticación
- Sigue esta guía completa desde el principio

---

## 🚀 Setup Inicial

### 1. Configuración de Base URL
```javascript
// Usar variable de entorno si está disponible, sino usar la URL por defecto
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io';
```

### 2. Helper para Requests Autenticados
```javascript
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  
  // No incluir Content-Type si el body es FormData (el browser lo hace automáticamente)
  const isFormData = options.body instanceof FormData;
  
  const config = {
    ...options,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  };
  
  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  // Si token expirado, intentar refresh
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // Reintentar la petición con el nuevo token
      config.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } else {
      // Si el refresh falla, lanzar error
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
  }
  
  return response;
}

async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    
    if (response.ok) {
      const { access_token, refresh_token } = await response.json();
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      return true;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
  
  // Si falla refresh, redirigir a login
  localStorage.clear();
  window.location.href = '/login';
  return false;
}
```

---

## 📋 Flujos Completos

### Flujo 0: Login y Logout

```javascript
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error en el login');
    }
    
    const { access_token, refresh_token } = await response.json();
    
    // Guardar tokens en localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    return { access_token, refresh_token };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

function logout() {
  // Limpiar tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Redirigir a login
  window.location.href = '/login';
}

// Uso:
try {
  await login('admin@cliente.com', 'password123');
  console.log('Login exitoso');
} catch (error) {
  console.error('Error de login:', error.message);
}

// Logout
logout();
```

---

### Flujo 1: Crear Cliente y Usuario Admin

```javascript
async function createClientAndAdmin(clientData, adminData) {
  try {
    // 1. Crear cliente
    const clientResponse = await apiRequest('/auth/create_client', {
      method: 'POST',
      body: JSON.stringify({
        id: clientData.id,
        name: clientData.name,
        contact_email: clientData.contact_email
      })
    });
    
    if (!clientResponse.ok) {
      const error = await clientResponse.json();
      throw new Error(error.detail || 'Error creando cliente');
    }
    
    const client = await clientResponse.json();
    console.log('Cliente creado:', client);
    
    // 2. Crear usuario admin para ese cliente
    const adminResponse = await apiRequest('/auth/create_client_user', {
      method: 'POST',
      body: JSON.stringify({
        email: adminData.email,
        password: adminData.password,
        client_id: String(clientData.id),
        role: 'admin'
      })
    });
    
    if (!adminResponse.ok) {
      const error = await adminResponse.json();
      throw new Error(error.detail || 'Error creando usuario admin');
    }
    
    const admin = await adminResponse.json();
    console.log('Admin creado:', admin);
    
    return { client, admin };
  } catch (error) {
    console.error('Error en createClientAndAdmin:', error);
    throw error;
  }
}

// Uso:
createClientAndAdmin(
  { id: 8, name: "Nuevo Cliente", contact_email: "contacto@cliente.com" },
  { email: "admin@cliente.com", password: "Password123!" }
);
```

---

### Flujo 2: Subir Archivo de Órdenes por Dealer

```javascript
async function uploadOrdersFile(file, targetClientId = null) {
  try {
    // Obtener usuario actual para determinar si es superadmin
    const userResponse = await apiRequest('/auth/me');
    if (!userResponse.ok) {
      throw new Error('Error obteniendo información del usuario');
    }
    const user = await userResponse.json();
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Si es superadmin, debe especificar target_client_id
    if (user.global_role === 'superadmin') {
      if (!targetClientId) {
        throw new Error('Superadmin debe especificar target_client_id');
      }
      formData.append('target_client_id', targetClientId);
    }
    
    // Usar apiRequest mejorado que maneja FormData correctamente
    const response = await apiRequest('/rpm/orders', {
      method: 'POST',
      body: formData
      // NO incluir Content-Type manualmente, apiRequest lo maneja automáticamente
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error procesando archivo');
    }
    
    const result = await response.json();
    console.log('Archivo procesado:', result);
    
    return result;
  } catch (error) {
    console.error('Error en uploadOrdersFile:', error);
    throw error;
  }
}

// Uso con input file:
const fileInput = document.getElementById('ordersFile');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const result = await uploadOrdersFile(file, 7); // 7 = client_id
      alert(`Archivo procesado: ${result.rows_inserted} filas insertadas`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }
});
```

---

### Flujo 3: Dashboard Completo

```javascript
class DashboardAPI {
  constructor() {
    this.user = null;
  }
  
  async initialize() {
    // Obtener usuario actual
    const userResponse = await apiRequest('/auth/me');
    this.user = await userResponse.json();
    
    // Cargar datos según rol
    if (this.user.global_role === 'superadmin') {
      await this.loadSuperadminData();
    } else {
      await this.loadClientData();
    }
  }
  
  async loadSuperadminData() {
    // Cargar todos los clientes
    const clientsResponse = await apiRequest('/clients');
    const clientsData = await clientsResponse.json();
    this.clients = clientsData.available_clients || [];
    
    // Cargar todas las aplicaciones
    const appsResponse = await apiRequest('/apps');
    this.apps = await appsResponse.json();
    
    // Cargar todos los usuarios
    const usersResponse = await apiRequest('/users');
    this.users = await usersResponse.json();
    
    return {
      clients: this.clients,
      apps: this.apps,
      users: this.users
    };
  }
  
  async loadClientData() {
    // Cargar información del cliente
    const clientResponse = await apiRequest(`/clients/${this.user.client_id}`);
    this.client = await clientResponse.json();
    
    // Cargar usuarios del cliente
    const usersResponse = await apiRequest(`/clients/${this.user.client_id}/users`);
    this.users = await usersResponse.json();
    
    // Cargar aplicaciones del cliente
    const appsResponse = await apiRequest(`/clients/${this.user.client_id}/apps`);
    this.apps = await appsResponse.json();
    
    // Cargar órdenes
    const ordersResponse = await apiRequest('/prism/orders');
    this.orders = await ordersResponse.json();
    
    // Cargar transferencias
    const transfersResponse = await apiRequest('/prism/transfers');
    this.transfers = await transfersResponse.json();
    
    return {
      client: this.client,
      users: this.users,
      apps: this.apps,
      orders: this.orders,
      transfers: this.transfers
    };
  }
  
  async getOrderItems(orderId) {
    const response = await apiRequest(`/prism/orders/${orderId}/items`);
    return await response.json();
  }
  
  async getTransferItems(transferId) {
    const response = await apiRequest(`/prism/transfers/${transferId}/items`);
    return await response.json();
  }
}

// Uso:
const dashboard = new DashboardAPI();
await dashboard.initialize();
```

---

### Flujo 4: Gestión de Usuarios

```javascript
class UserManagement {
  async createUser(email, password, clientId, role = 'user') {
    const response = await apiRequest('/auth/create_client_user', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        client_id: String(clientId),
        role
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return await response.json();
  }
  
  async listUsers(clientId = null) {
    const endpoint = clientId 
      ? `/users?client_id=${clientId}`
      : '/users';
    
    const response = await apiRequest(endpoint);
    return await response.json();
  }
  
  async deleteUser(userId) {
    const response = await apiRequest(`/users/${userId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return await response.json();
  }
}

// Uso:
const userMgmt = new UserManagement();

// Crear usuario
await userMgmt.createUser('nuevo@cliente.com', 'Password123!', 7, 'user');

// Listar usuarios
const users = await userMgmt.listUsers(7);

// Eliminar usuario
await userMgmt.deleteUser('user-uuid');
```

---

### Flujo 5: Gestión de Aplicaciones

```javascript
class AppManagement {
  async listApps() {
    const response = await apiRequest('/apps');
    return await response.json();
  }
  
  async createApp(name, description) {
    const response = await apiRequest('/apps', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return await response.json();
  }
  
  async getClientApps(clientId) {
    const response = await apiRequest(`/clients/${clientId}/apps`);
    return await response.json();
  }
  
  async assignAppToClient(clientId, applicationId) {
    const response = await apiRequest(`/clients/${clientId}/apps`, {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        application_id: applicationId,
        status: 'active'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return await response.json();
  }
  
  async removeAppFromClient(clientId, appId) {
    const response = await apiRequest(`/clients/${clientId}/apps/${appId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return await response.json();
  }
}

// Uso:
const appMgmt = new AppManagement();

// Listar todas las apps
const allApps = await appMgmt.listApps();

// Asignar app a cliente
await appMgmt.assignAppToClient(7, 3); // Cliente 7, App 3 (SEEDZ)

// Ver apps de un cliente
const clientApps = await appMgmt.getClientApps(7);
```

---

## 🎨 Ejemplo de Componente React

```jsx
import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io';

function OrdersUpload({ clientId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (clientId) {
        formData.append('target_client_id', clientId);
      }
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE_URL}/rpm/orders`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // NO incluir Content-Type, el browser lo hace automáticamente para FormData
          },
          body: formData
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
      }
      
      const data = await response.json();
      setResult(data);
      alert(`Archivo procesado: ${data.rows_inserted} filas insertadas`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input type="file" onChange={handleFileChange} accept=".dat,.txt,.ord" />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Subiendo...' : 'Subir Archivo ORD'}
      </button>
      {result && (
        <div>
          <p>Filas procesadas: {result.rows_processed}</p>
          <p>Filas insertadas: {result.rows_inserted}</p>
        </div>
      )}
    </div>
  );
}

export default OrdersUpload;
```

---

## 📊 Ejemplo de Visualización de Órdenes

```jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io';

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    loadOrders();
  }, []);
  
  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE_URL}/prism/orders`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    }
  };
  
  const loadOrderItems = async (orderId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_BASE_URL}/prism/orders/${orderId}/items`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setItems(data);
      setSelectedOrder(orderId);
    } catch (error) {
      console.error('Error cargando items:', error);
    }
  };
  
  return (
    <div>
      <h2>Órdenes</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Order ID</th>
            <th>Fecha</th>
            <th>Procesado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.order_id}</td>
              <td>{new Date(order.order_date).toLocaleDateString()}</td>
              <td>{order.processed ? '✓' : '✗'}</td>
              <td>
                <button onClick={() => loadOrderItems(order.id)}>
                  Ver Items
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {selectedOrder && (
        <div>
          <h3>Items de Orden {selectedOrder}</h3>
          <table>
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Cantidad</th>
                <th>Dealer</th>
                <th>Warehouse</th>
                <th>Procesado</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.part_number}</td>
                  <td>{item.order_quantity}</td>
                  <td>{item.dealer_account}</td>
                  <td>{item.dbs_warehouse}</td>
                  <td>{item.processed ? '✓' : '✗'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## 🔒 Manejo de Errores

```javascript
async function handleApiError(response) {
  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch (e) {
      error = { detail: 'Error desconocido' };
    }
    
    switch (response.status) {
      case 401:
        // Token expirado, intentar refresh
        const refreshed = await refreshToken();
        if (!refreshed) {
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        break;
      case 403:
        throw new Error('No tienes permisos para realizar esta acción.');
      case 404:
        throw new Error('Recurso no encontrado.');
      case 400:
        throw new Error(error.detail || 'Datos inválidos.');
      default:
        throw new Error(error.detail || 'Error del servidor.');
    }
  }
  
  return response;
}

// Uso:
try {
  const response = await apiRequest('/some/endpoint');
  await handleApiError(response);
  const data = await response.json();
} catch (error) {
  console.error('Error:', error.message);
  // Mostrar error al usuario
}
```

---

## 📝 Checklist para Frontend

### Si migras a la API con autenticación:
- [ ] Implementar login/logout
- [ ] Guardar tokens en localStorage
- [ ] Implementar refresh token automático
- [ ] Crear componente de gestión de clientes (superadmin)
- [ ] Crear componente de creación de usuarios
- [ ] Crear componente de gestión de aplicaciones
- [ ] Migrar componente de subida de archivos ORD/TRF a nueva API
- [ ] Crear componente de visualización de órdenes
- [ ] Crear componente de visualización de transferencias
- [ ] Implementar manejo de errores
- [ ] Implementar loading states
- [ ] Validar permisos antes de mostrar acciones

### Si mantienes tu API actual (sin autenticación):
- [x] ✅ Subida de archivos (`/dtf/upload`) - **YA IMPLEMENTADO**
- [x] ✅ Visualización de status de archivos (`/dealers/{id}/logs/{type}`) - **YA IMPLEMENTADO**
- [x] ✅ Gestión de dealers/clientes - **YA IMPLEMENTADO**
- [ ] Mejorar manejo de errores
- [ ] Mejorar loading states
- [ ] Agregar validaciones adicionales si es necesario
