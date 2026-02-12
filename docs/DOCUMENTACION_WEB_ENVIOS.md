# 📚 Documentación para Web de Envíos Manuales

Esta documentación describe cómo implementar una interfaz web para realizar envíos manuales de archivos a John Deere y Seedz, con sistema de autenticación por cuentas.

---

## 📋 Tabla de Contenidos

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Autenticación](#autenticación)
3. [Endpoints de Envío](#endpoints-de-envío)
4. [Flujos de Envío Detallados](#flujos-de-envío-detallados)
5. [Ejemplos de Implementación](#ejemplos-de-implementación)
6. [Manejo de Errores](#manejo-de-errores)
7. [Consideraciones de Seguridad](#consideraciones-de-seguridad)

---

## 🎯 Resumen del Sistema

### Base URL
```
https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io
```

### Plataformas Soportadas

#### 🔵 John Deere
- **PMM**: Archivos `.dat` (Parts Management Module)
- **PartsData**: Archivos `.DPMBRA` (Parts Data)
- **ELIPS**: Archivos `.json` o `.xml` (Electronic Parts Information System)

#### 🟢 Seedz
- **Invoice**: Facturas
- **Invoice Items**: Items de factura
- **Customers**: Clientes
- **Items**: Productos
- **Items Branding**: Branding de productos
- **Orders**: Órdenes
- **Items Group**: Grupos de items
- **Sellers**: Vendedores

### Flujo General de Envío

```
1. Usuario hace login → Obtiene token JWT
2. Usuario selecciona archivo y tipo de envío
3. Sistema verifica permisos del usuario
4. Sistema obtiene credenciales del servicio externo
5. Sistema obtiene token OAuth del servicio externo
6. Sistema envía archivo directamente al servicio externo
7. Sistema guarda log y notifica resultado
```

---

## 🔐 Autenticación

### 1. Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Credenciales inválidas"
}
```

### 2. Obtener Información del Usuario

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "user_id": 123,
  "email": "usuario@ejemplo.com",
  "client_id": 7,
  "client_name": "Nombre del Cliente",
  "dealer_name": "Nombre del Dealer",
  "role": "user",
  "global_role": "user"
}
```

**Nota:** `global_role` puede ser:
- `"user"`: Usuario normal (solo puede enviar para su propio `client_id`)
- `"admin"`: Superadmin (puede especificar `target_client_id`)

### 3. Verificar Acceso a Aplicación

**Endpoint:** `GET /auth/check-app-access/{app_name}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Parámetros:**
- `app_name`: `"RPM"`, `"ELIPS"` o `"SEEDZ"`

**Response (200 OK):**
```json
{
  "has_access": true,
  "reason": "Usuario tiene acceso a la aplicación"
}
```

**Response (200 OK - Sin acceso):**
```json
{
  "has_access": false,
  "reason": "Usuario no tiene permisos para esta aplicación"
}
```

---

## 📤 Endpoints de Envío

### 🔵 John Deere - PMM

**Endpoint:** `POST /rpm/pmm/send-to-johndeere`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Body (FormData):**
- `file` (File, requerido): Archivo `.dat`
- `target_client_id` (Number, opcional): Solo para superadmins

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Archivo PMM enviado exitosamente a John Deere",
  "filename": "archivo_pmm.dat",
  "file_type": "pmm",
  "client_id": 7,
  "john_deere_response": "OK",
  "sent_at": "2025-01-26T18:06:17Z",
  "processed_by": "usuario@ejemplo.com",
  "blob_storage": {
    "saved": true,
    "blob_name": "7/rpm/johndeere/pmm/20250126_180617_archivo_pmm.dat",
    "blob_url": "https://storage.blob.core.windows.net/..."
  }
}
```

---

### 🔵 John Deere - PartsData

**Endpoint:** `POST /rpm/partsdata/send-to-johndeere`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Body (FormData):**
- `file` (File, requerido): Archivo `.DPMBRA`
- `target_client_id` (Number, opcional): Solo para superadmins

**Nota Importante:** 
- Este endpoint automáticamente:
  1. Obtiene `order_ids` y `transfer_ids` procesados pendientes
  2. Modifica el archivo agregando estos IDs en la primera línea
  3. Envía el archivo modificado a John Deere
  4. Marca los orders y transfers como enviados

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Archivo PartsData enviado exitosamente a John Deere",
  "filename": "archivo.DPMBRA",
  "file_type": "partsdata",
  "client_id": 7,
  "john_deere_response": "OK",
  "sent_at": "2025-01-26T18:06:17Z",
  "processed_by": "usuario@ejemplo.com",
  "blob_storage": {
    "saved": true,
    "blob_name": "7/rpm/johndeere/partsdata/20250126_180617_archivo.DPMBRA",
    "blob_url": "https://storage.blob.core.windows.net/..."
  }
}
```

---

### 🔵 John Deere - ELIPS

**Endpoint:** `POST /elips/send-to-johndeere`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Body (FormData):**
- `file` (File, requerido): Archivo `.json` o `.xml`
- `target_client_id` (Number, opcional): Solo para superadmins

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Archivo ELIPS (json) enviado exitosamente a John Deere",
  "filename": "archivo_elips.json",
  "file_type": "delta",
  "file_format": "json",
  "client_id": 7,
  "john_deere_response": "OK",
  "sent_at": "2025-01-26T18:06:17Z",
  "processed_by": "usuario@ejemplo.com",
  "blob_storage": {
    "saved": true,
    "blob_name": "7/elips/johndeere/json/20250126_180617_archivo_elips.json",
    "blob_url": "https://storage.blob.core.windows.net/..."
  }
}
```

---

### 🟢 Seedz - Invoice

**Endpoint:** `POST /seedz/invoice`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Body (FormData):**
- `file` (File, requerido): Archivo `.json` o `.csv`
- `target_client_id` (Number, opcional): Solo para superadmins

**Nota:** Si el archivo es `.csv`, se convierte automáticamente a JSON antes de enviarlo.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Archivo invoice enviado exitosamente a Seedz",
  "filename": "invoice.json",
  "file_type": "invoice",
  "client_id": 7,
  "seedz_response": {
    "status": "success",
    "records_processed": 150
  },
  "sent_at": "2025-01-26T18:06:17Z",
  "processed_by": "usuario@ejemplo.com",
  "blob_storage": {
    "saved": true,
    "blob_name": "7/seedz/invoice/20250126_180617_invoice.json",
    "blob_url": "https://storage.blob.core.windows.net/..."
  }
}
```

---

### 🟢 Seedz - Otros Tipos

Los siguientes endpoints siguen el mismo patrón que `/seedz/invoice`:

- `POST /seedz/invoice_items` - Invoice Items
- `POST /seedz/invoice-items` - Invoice Items (alias)
- `POST /seedz/customers` - Customers
- `POST /seedz/items` - Items
- `POST /seedz/items-branding` - Items Branding
- `POST /seedz/orders` - Orders
- `POST /seedz/items-group` - Items Group
- `POST /seedz/sellers` - Sellers

**Todos aceptan:**
- `file` (File, requerido): Archivo `.json` o `.csv`
- `target_client_id` (Number, opcional): Solo para superadmins

---

## 🔄 Flujos de Envío Detallados

### Flujo: Envío a John Deere (PMM/PartsData/ELIPS)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario selecciona archivo y tipo                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Frontend: POST /auth/check-app-access/{app_name}     │
│    - Verifica si usuario tiene permisos                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Frontend: POST /rpm/pmm/send-to-johndeere            │
│    (o /rpm/partsdata/send-to-johndeere                  │
│     o /elips/send-to-johndeere)                         │
│    - Envía archivo como FormData                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Backend procesa:                                      │
│    a) Obtiene credenciales desde /rpm/credentials      │
│       (o /elips/credentials)                            │
│    b) Obtiene token OAuth de John Deere                 │
│    c) Si es PartsData:                                  │
│       - Obtiene order_ids y transfer_ids                │
│       - Modifica archivo agregando IDs                 │
│    d) Envía archivo a John Deere                        │
│    e) Si es PartsData y exitoso:                        │
│       - Marca orders y transfers como enviados         │
│    f) Guarda en Blob Storage                            │
│    g) Crea log remoto                                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Frontend recibe respuesta con resultado              │
└─────────────────────────────────────────────────────────┘
```

### Flujo: Envío a Seedz

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario selecciona archivo y tipo                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Frontend: POST /auth/check-app-access/SEEDZ         │
│    - Verifica si usuario tiene permisos                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Frontend: POST /seedz/{tipo}                          │
│    - Envía archivo como FormData                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Backend procesa:                                      │
│    a) Obtiene credenciales desde /seedz/credentials    │
│    b) Obtiene token OAuth de Seedz                      │
│    c) Si archivo es CSV: convierte a JSON               │
│    d) Envía archivo a Seedz                             │
│    e) Guarda en Blob Storage                            │
│    f) Crea log remoto                                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Frontend recibe respuesta con resultado              │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Ejemplos de Implementación

### JavaScript/TypeScript (Frontend)

#### 1. Servicio de Autenticación

```typescript
// auth.service.ts
const API_BASE_URL = 'https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io';

class AuthService {
  private token: string | null = null;
  private userInfo: any = null;

  async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }

    const data = await response.json();
    this.token = data.access_token;
    localStorage.setItem('token', this.token);
    return this.token;
  }

  async getUserInfo(): Promise<any> {
    if (this.userInfo) return this.userInfo;

    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error obteniendo información del usuario');
    }

    this.userInfo = await response.json();
    return this.userInfo;
  }

  async checkAppAccess(appName: string): Promise<boolean> {
    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/auth/check-app-access/${appName}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.has_access;
  }

  getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token || '';
  }

  logout(): void {
    this.token = null;
    this.userInfo = null;
    localStorage.removeItem('token');
  }
}

export const authService = new AuthService();
```

#### 2. Servicio de Envíos

```typescript
// upload.service.ts
const API_BASE_URL = 'https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io';

class UploadService {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async sendToJohnDeere(
    file: File,
    type: 'pmm' | 'partsdata' | 'elips',
    targetClientId?: number
  ): Promise<any> {
    const token = this.authService.getToken();
    
    // Verificar acceso
    const appName = type === 'elips' ? 'ELIPS' : 'RPM';
    const hasAccess = await this.authService.checkAppAccess(appName);
    
    if (!hasAccess) {
      throw new Error(`No tiene acceso a ${appName}`);
    }

    // Determinar endpoint
    let endpoint = '';
    if (type === 'pmm') {
      endpoint = '/rpm/pmm/send-to-johndeere';
    } else if (type === 'partsdata') {
      endpoint = '/rpm/partsdata/send-to-johndeere';
    } else if (type === 'elips') {
      endpoint = '/elips/send-to-johndeere';
    } else {
      throw new Error('Tipo de archivo no válido');
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('file', file);
    if (targetClientId) {
      formData.append('target_client_id', targetClientId.toString());
    }

    // Enviar
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error enviando archivo');
    }

    return await response.json();
  }

  async sendToSeedz(
    file: File,
    type: 'invoice' | 'invoice_items' | 'customers' | 'items' | 'items-branding' | 'orders' | 'items-group' | 'sellers',
    targetClientId?: number
  ): Promise<any> {
    const token = this.authService.getToken();
    
    // Verificar acceso
    const hasAccess = await this.authService.checkAppAccess('SEEDZ');
    
    if (!hasAccess) {
      throw new Error('No tiene acceso a SEEDZ');
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('file', file);
    if (targetClientId) {
      formData.append('target_client_id', targetClientId.toString());
    }

    // Enviar
    const response = await fetch(`${API_BASE_URL}/seedz/${type}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error enviando archivo');
    }

    return await response.json();
  }
}

export const uploadService = new UploadService(authService);
```

#### 3. Componente de Login

```tsx
// LoginForm.tsx
import React, { useState } from 'react';
import { authService } from './auth.service';

const LoginForm: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Contraseña:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default LoginForm;
```

#### 4. Componente React de Envío

```tsx
// UploadForm.tsx
import React, { useState, useEffect } from 'react';
import { authService } from './auth.service';
import { uploadService } from './upload.service';

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [targetClientId, setTargetClientId] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Cargar información del usuario al montar
    authService.getUserInfo()
      .then(setUserInfo)
      .catch(err => console.error('Error obteniendo info del usuario:', err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Validar tamaño (ejemplo: máximo 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (selectedFile.size > maxSize) {
        setError(`El archivo es muy grande. Tamaño máximo: 100MB`);
        setFile(null);
        return;
      }
      
      setError(''); // Limpiar error si el archivo es válido
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !uploadType) {
      setError('Por favor seleccione un archivo y tipo de envío');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let response;
      
      if (uploadType.startsWith('johndeere-')) {
        const type = uploadType.replace('johndeere-', '') as 'pmm' | 'partsdata' | 'elips';
        response = await uploadService.sendToJohnDeere(file, type, targetClientId);
      } else if (uploadType.startsWith('seedz-')) {
        const type = uploadType.replace('seedz-', '') as any;
        response = await uploadService.sendToSeedz(file, type, targetClientId);
      } else {
        throw new Error('Tipo de envío no válido');
      }

      setResult(response);
      setFile(null); // Limpiar archivo después de envío exitoso
    } catch (err: any) {
      setError(err.message || 'Error enviando archivo');
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdmin = userInfo?.global_role === 'admin';

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Archivo:</label>
        <input type="file" onChange={handleFileChange} />
      </div>

      <div>
        <label>Tipo de Envío:</label>
        <select value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
          <option value="">Seleccione...</option>
          <optgroup label="John Deere">
            <option value="johndeere-pmm">PMM (.dat)</option>
            <option value="johndeere-partsdata">PartsData (.DPMBRA)</option>
            <option value="johndeere-elips">ELIPS (.json, .xml)</option>
          </optgroup>
          <optgroup label="Seedz">
            <option value="seedz-invoice">Invoice</option>
            <option value="seedz-invoice_items">Invoice Items</option>
            <option value="seedz-customers">Customers</option>
            <option value="seedz-items">Items</option>
            <option value="seedz-items-branding">Items Branding</option>
            <option value="seedz-orders">Orders</option>
            <option value="seedz-items-group">Items Group</option>
            <option value="seedz-sellers">Sellers</option>
          </optgroup>
        </select>
      </div>

      {isSuperAdmin && (
        <div>
          <label>Client ID (Opcional, solo para superadmins):</label>
          <input
            type="number"
            value={targetClientId || ''}
            onChange={(e) => setTargetClientId(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Dejar vacío para usar su propio client_id"
          />
        </div>
      )}

      {file && (
        <div>
          <p>Archivo seleccionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
        </div>
      )}

      <button type="submit" disabled={loading || !file || !uploadType}>
        {loading ? 'Enviando...' : 'Enviar Archivo'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {result && (
        <div style={{ color: 'green', marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '5px' }}>
          <h3>✅ Envío Exitoso</h3>
          <p><strong>Archivo:</strong> {result.filename}</p>
          <p><strong>Tipo:</strong> {result.file_type}</p>
          <p><strong>Enviado:</strong> {new Date(result.sent_at).toLocaleString()}</p>
          {result.blob_storage?.blob_url && (
            <p><strong>Blob URL:</strong> <a href={result.blob_storage.blob_url} target="_blank" rel="noopener noreferrer">Ver archivo</a></p>
          )}
        </div>
      )}
    </form>
  );
};

export default UploadForm;
```

#### 5. Componente Principal (App)

```tsx
// App.tsx
import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import UploadForm from './UploadForm';
import { authService } from './auth.service';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token guardado
    const token = authService.getToken();
    if (token) {
      // Verificar si el token es válido
      authService.getUserInfo()
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          // Token inválido, limpiar
          authService.logout();
          setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #ccc' }}>
        <h1>Sistema de Envíos</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </header>
      <main style={{ padding: '20px' }}>
        <UploadForm />
      </main>
    </div>
  );
};

export default App;
```

---

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Acción Recomendada |
|--------|-------------|-------------------|
| 200 | Éxito | Mostrar mensaje de éxito |
| 400 | Bad Request | Verificar formato del archivo |
| 401 | Unauthorized | Reautenticar usuario |
| 403 | Forbidden | Usuario no tiene permisos |
| 404 | Not Found | Endpoint o recurso no existe |
| 500 | Internal Server Error | Error del servidor, reintentar |

### Estructura de Errores

```json
{
  "detail": "Mensaje de error descriptivo"
}
```

### Ejemplo de Manejo de Errores

```typescript
try {
  const response = await uploadService.sendToJohnDeere(file, 'pmm');
  // Éxito
} catch (error: any) {
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 401:
        // Token expirado, reautenticar
        authService.logout();
        window.location.href = '/login';
        break;
      case 403:
        // Sin permisos
        alert('No tiene permisos para enviar este tipo de archivo');
        break;
      case 400:
        // Archivo inválido
        alert('El archivo no es válido. Verifique el formato.');
        break;
      default:
        alert('Error enviando archivo. Por favor intente nuevamente.');
    }
  } else {
    alert('Error de conexión. Verifique su internet.');
  }
}
```

---

## 🔒 Consideraciones de Seguridad

### 1. Almacenamiento de Tokens

- **✅ Hacer:** Almacenar tokens en `localStorage` o `sessionStorage`
- **❌ No hacer:** Almacenar tokens en cookies no seguras
- **✅ Hacer:** Implementar refresh automático de tokens antes de expirar

### 2. Validación de Archivos

- **✅ Hacer:** Validar extensión y tipo MIME del archivo antes de enviar
- **✅ Hacer:** Limitar tamaño máximo de archivo (ej: 100MB)
- **✅ Hacer:** Mostrar progreso de carga para archivos grandes

### 3. Permisos de Usuario

- **✅ Hacer:** Verificar permisos antes de mostrar opciones de envío
- **✅ Hacer:** Ocultar campo `target_client_id` si el usuario no es superadmin
- **✅ Hacer:** Validar permisos en el frontend pero confiar en el backend

### 4. Manejo de Errores

- **✅ Hacer:** No exponer detalles técnicos de errores al usuario
- **✅ Hacer:** Registrar errores en el sistema de logging
- **✅ Hacer:** Mostrar mensajes de error amigables al usuario

### 5. Timeouts

- **✅ Hacer:** Implementar timeouts para requests largos
- **✅ Hacer:** Mostrar indicador de progreso para archivos grandes
- **✅ Hacer:** Permitir cancelar operaciones en progreso

---

## 📝 Notas Adicionales

### Archivos Grandes

Para archivos muy grandes (>100MB), el sistema soporta un flujo alternativo usando SAS URLs de Azure Blob Storage. Ver documentación en `BLOB_STORAGE_ENDPOINTS.md`.

### PartsData Especial

Cuando se envía un archivo PartsData:
1. El sistema automáticamente obtiene `order_ids` y `transfer_ids` procesados
2. Modifica el archivo agregando estos IDs en la primera línea
3. Envía el archivo modificado
4. Marca los orders y transfers como enviados

No es necesario hacer nada especial en el frontend para esto.

### Conversión CSV a JSON (Seedz)

Si se envía un archivo `.csv` a Seedz, el sistema automáticamente lo convierte a JSON antes de enviarlo. El frontend no necesita hacer esta conversión.

### Blob Storage

Todos los archivos enviados se guardan automáticamente en Azure Blob Storage. La respuesta incluye información del blob guardado.

---

## 🚀 Próximos Pasos

1. Implementar interfaz de login
2. Implementar formulario de envío con validaciones
3. Implementar dashboard para ver historial de envíos
4. Agregar notificaciones en tiempo real
5. Implementar sistema de logs y auditoría

---

## 📞 Soporte

Para más información o soporte, consultar:
- Documentación Swagger: `https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io/docs`
- Archivos de documentación en el repositorio

