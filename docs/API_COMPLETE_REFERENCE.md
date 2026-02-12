# Documentación de Endpoints de Envío de Archivos

Esta documentación describe cómo usar los endpoints para enviar archivos directamente a servicios externos (John Deere y Seedz) a través del backend.

## Tabla de Contenidos

- [Autenticación](#autenticación)
- [Endpoints ELIPS (John Deere)](#endpoints-elips-john-deere)
- [Endpoints RPM (John Deere)](#endpoints-rpm-john-deere)
- [Endpoints SEEDZ](#endpoints-seedz)
- [Manejo de Errores](#manejo-de-errores)
- [Ejemplos de Código](#ejemplos-de-código)

---

## Autenticación

Todos los endpoints requieren autenticación mediante **Bearer Token** (OAuth2).

**Header requerido:**
```
Authorization: Bearer {tu_token_de_acceso}
```

**Permisos necesarios:**
- Para endpoints ELIPS: Permisos de aplicación **ELIPS**
- Para endpoints RPM: Permisos de aplicación **RPM**
- Para endpoints SEEDZ: Permisos de aplicación **SEEDZ**

---

## Endpoints ELIPS (John Deere)

### Enviar archivo ELIPS a John Deere

**Endpoint:** `POST /elips/send-to-johndeere`

**Descripción:** Envía un archivo ELIPS (JSON o XML) directamente a John Deere sin guardarlo en Blob Storage.

**Parámetros:**
- `file` (FormData, requerido): Archivo a enviar (debe ser `.json` o `.xml`)
- `target_client_id` (FormData, opcional): ID del cliente objetivo (solo para superadmins)

**Ejemplo de uso (JavaScript/Fetch):**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
// Opcional para admins:
// formData.append('target_client_id', '7');

const response = await fetch('/elips/send-to-johndeere', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const result = await response.json();
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Archivo ELIPS (json) enviado exitosamente a John Deere",
  "filename": "archivo.json",
  "client_id": 7,
  "file_type": "delta",
  "file_format": "json",
  "john_deere_response": "OK",
  "sent_at": "2024-01-15T10:30:00Z",
  "processed_by": "usuario@ejemplo.com"
}
```

**Errores comunes:**
- `400`: Extensión de archivo incorrecta (debe ser .json o .xml)
- `403`: Usuario sin permisos ELIPS o intento de especificar target_client_id sin ser admin
- `404`: No se encontraron credenciales de John Deere para el cliente
- `500`: Error al enviar el archivo a John Deere

---

## Endpoints RPM (John Deere)

### Enviar archivo PMM a John Deere

**Endpoint:** `POST /rpm/pmm/send-to-johndeere`

**Descripción:** Envía un archivo RPM de tipo PMM (`.dat`) directamente a John Deere.

**Parámetros:**
- `file` (FormData, requerido): Archivo `.dat` de tipo PMM
- `target_client_id` (FormData, opcional): ID del cliente objetivo (solo para superadmins)

**Ejemplo de uso:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
// Opcional para admins:
// formData.append('target_client_id', '7');

const response = await fetch('/rpm/pmm/send-to-johndeere', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

### Enviar archivo PARTSDATA a John Deere

**Endpoint:** `POST /rpm/partsdata/send-to-johndeere`

**Descripción:** Envía un archivo RPM de tipo PARTSDATA (`.DPMBRA`) directamente a John Deere.

**Parámetros:**
- `file` (FormData, requerido): Archivo `.DPMBRA` de tipo PARTSDATA
- `target_client_id` (FormData, opcional): ID del cliente objetivo (solo para superadmins)

### Enviar archivo ORDERS a John Deere

**Endpoint:** `POST /rpm/orders/send-to-johndeere`

**Descripción:** Envía un archivo RPM de tipo ORDERS (`.dat`) directamente a John Deere.

**Parámetros:**
- `file` (FormData, requerido): Archivo `.dat` de tipo ORDERS
- `target_client_id` (FormData, opcional): ID del cliente objetivo (solo para superadmins)

### Enviar archivo TRANSFERS a John Deere

**Endpoint:** `POST /rpm/transfers/send-to-johndeere`

**Descripción:** Envía un archivo RPM de tipo TRANSFERS (`.dat`) directamente a John Deere.

**Parámetros:**
- `file` (FormData, requerido): Archivo `.dat` de tipo TRANSFERS
- `target_client_id` (FormData, opcional): ID del cliente objetivo (solo para superadmins)

**Respuesta exitosa (200) - Ejemplo RPM:**
```json
{
  "success": true,
  "message": "Archivo RPM (pmm) enviado exitosamente a John Deere",
  "filename": "archivo.dat",
  "file_type": "pmm",
  "client_id": 7,
  "john_deere_response": "OK",
  "sent_at": "2024-01-15T10:30:00Z",
  "processed_by": "usuario@ejemplo.com"
}
```

**Respuesta exitosa para PARTSDATA (incluye IDs procesados):**
```json
{
  "success": true,
  "message": "Archivo RPM (partsdata) enviado exitosamente a John Deere",
  "filename": "archivo.DPMBRA",
  "file_type": "partsdata",
  "client_id": 7,
  "john_deere_response": "OK",
  "sent_at": "2024-01-15T10:30:00Z",
  "processed_by": "usuario@ejemplo.com",
  "partsdata_ids": {
    "order_ids_count": 5,
    "transfer_ids_count": 3,
    "total_ids": 8
  }
}
```

---

## Endpoints SEEDZ

### Enviar archivo de Invoices

**Endpoint:** `POST /seedz/invoices`

**Descripción:** Envía un archivo de facturas directamente a Seedz.

**Parámetros:**
- `file` (FormData, requerido): Archivo CSV de invoices
- `target_client_id` (FormData, opcional): ID del cliente objetivo (solo para superadmins)

### Enviar archivo de Invoice Items

**Endpoint:** `POST /seedz/invoice_items`

**Descripción:** Envía un archivo de items de factura directamente a Seedz.

### Enviar archivo de Customers

**Endpoint:** `POST /seedz/customers`

**Descripción:** Envía un archivo de clientes directamente a Seedz.

### Enviar archivo de Items

**Endpoint:** `POST /seedz/items`

**Descripción:** Envía un archivo de items directamente a Seedz.

### Enviar archivo de Items Branding

**Endpoint:** `POST /seedz/items-branding`

**Descripción:** Envía un archivo de items con branding directamente a Seedz.

### Enviar archivo de Orders

**Endpoint:** `POST /seedz/orders`

**Descripción:** Envía un archivo de órdenes directamente a Seedz.

### Enviar archivo de Address

**Endpoint:** `POST /seedz/address`

**Descripción:** Envía un archivo de direcciones directamente a Seedz.

### Enviar archivo de Items Group

**Endpoint:** `POST /seedz/items-group`

**Descripción:** Envía un archivo de grupos de items directamente a Seedz.

### Enviar archivo de Sellers

**Endpoint:** `POST /seedz/sellers`

**Descripción:** Envía un archivo de vendedores directamente a Seedz.

**Ejemplo de uso (todos los endpoints SEEDZ):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
// Opcional para admins:
// formData.append('target_client_id', '7');

const response = await fetch('/seedz/invoices', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const result = await response.json();
```

**Respuesta exitosa (200) - Ejemplo SEEDZ:**
```json
{
  "success": true,
  "message": "Archivo invoices enviado exitosamente a Seedz",
  "filename": "invoices.csv",
  "file_type": "invoices",
  "client_id": 7,
  "seedz_response": "OK",
  "sent_at": "2024-01-15T10:30:00Z",
  "processed_by": "usuario@ejemplo.com"
}
```

---

## Manejo de Errores

Todos los endpoints retornan errores en el siguiente formato:

```json
{
  "detail": "Mensaje de error descriptivo"
}
```

### Códigos de estado HTTP comunes:

- **200 OK**: Archivo enviado exitosamente
- **400 Bad Request**: 
  - Archivo vacío
  - Extensión de archivo incorrecta
  - Tipo de archivo no válido
  - `client_id` inválido
- **401 Unauthorized**: 
  - Token de autenticación faltante o inválido
  - Token expirado
- **403 Forbidden**: 
  - Usuario sin permisos para la aplicación
  - Usuario sin cliente asignado
  - Usuario normal intentando especificar `target_client_id`
  - Credenciales inactivas
- **404 Not Found**: 
  - Credenciales no encontradas para el cliente
- **500 Internal Server Error**: 
  - Error al comunicarse con el servicio externo
  - Error interno del servidor

---

## Ejemplos de Código

### Ejemplo completo con React

```javascript
import React, { useState } from 'react';

function FileUploader({ endpoint, accessToken, isAdmin, targetClientId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Si es admin y especificó un client_id, agregarlo
      if (isAdmin && targetClientId) {
        formData.append('target_client_id', targetClientId);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al enviar el archivo');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        disabled={loading}
      />
      
      {isAdmin && (
        <input
          type="number"
          placeholder="Client ID (opcional)"
          onChange={(e) => setTargetClientId(e.target.value)}
        />
      )}

      <button type="submit" disabled={loading || !file}>
        {loading ? 'Enviando...' : 'Enviar Archivo'}
      </button>

      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className="success">
          <p>{result.message}</p>
          <p>Archivo: {result.filename}</p>
          <p>Cliente: {result.client_id}</p>
        </div>
      )}
    </form>
  );
}
```

### Ejemplo con Axios

```javascript
import axios from 'axios';

async function sendFileToJohnDeere(file, accessToken, targetClientId = null) {
  const formData = new FormData();
  formData.append('file', file);
  
  if (targetClientId) {
    formData.append('target_client_id', targetClientId);
  }

  try {
    const response = await axios.post(
      '/elips/send-to-johndeere',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Error al enviar archivo');
    }
    throw error;
  }
}
```

### Ejemplo con HTML puro + JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Enviar Archivo</title>
</head>
<body>
  <form id="uploadForm">
    <input type="file" id="fileInput" required />
    <input type="number" id="clientId" placeholder="Client ID (solo admins)" />
    <button type="submit">Enviar</button>
  </form>

  <div id="result"></div>

  <script>
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const fileInput = document.getElementById('fileInput');
      const clientIdInput = document.getElementById('clientId');
      const resultDiv = document.getElementById('result');
      
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      
      if (clientIdInput.value) {
        formData.append('target_client_id', clientIdInput.value);
      }

      try {
        const response = await fetch('/elips/send-to-johndeere', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${yourAccessToken}`
          },
          body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
          resultDiv.innerHTML = `
            <h3>Éxito!</h3>
            <p>${data.message}</p>
            <p>Archivo: ${data.filename}</p>
            <p>Cliente: ${data.client_id}</p>
          `;
        } else {
          resultDiv.innerHTML = `<p style="color: red;">Error: ${data.detail}</p>`;
        }
      } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
      }
    });
  </script>
</body>
</html>
```

---

## Notas Importantes

1. **Permisos**: Cada usuario debe tener permisos para la aplicación correspondiente (ELIPS, RPM o SEEDZ) en su cliente.

2. **Superadmins**: Los usuarios con rol `admin` pueden especificar `target_client_id` para enviar archivos en nombre de otros clientes. Si no lo especifican, se usa su propio cliente.

3. **Usuarios normales**: Siempre usan su propio `client_id` y no pueden especificar `target_client_id`.

4. **Credenciales**: Las credenciales (dealer_id, client_id, secret) se obtienen automáticamente desde la base de datos según el `client_id` utilizado.

5. **Sin almacenamiento**: Los archivos se envían directamente a los servicios externos **sin guardarse en Blob Storage**.

6. **Logs**: Todos los envíos (exitosos o fallidos) se registran automáticamente en la base de datos para auditoría.

---

## Base URL

Asegúrate de usar la URL base correcta según tu entorno:

- **Desarrollo**: `http://localhost:8000`
- **Producción**: `https://tu-dominio.com`

Ejemplo completo de URL:
```
https://tu-dominio.com/elips/send-to-johndeere
```
