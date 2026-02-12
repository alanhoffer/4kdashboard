# 🔑 Endpoints para Obtener Bearer Tokens

Este documento explica cómo usar los endpoints para obtener bearer tokens de John Deere y Seedz.

---

## 📋 Índice

1. [Endpoint John Deere](#endpoint-john-deere)
2. [Endpoint Seedz](#endpoint-seedz)
3. [Ejemplos de Uso](#ejemplos-de-uso)
4. [Manejo de Errores](#manejo-de-errores)

---

## 🔵 Endpoint John Deere

### `GET /johndeere/bearer-token`

Obtiene el bearer token de OAuth de John Deere para el cliente del usuario autenticado.

### Requisitos

- ✅ Usuario autenticado (cualquier rol)
- ✅ Usuario debe tener un `client_id` asignado
- ✅ El cliente debe tener credenciales de John Deere configuradas y activas

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `target_client_id` | `int` (query) | No | Solo para superadmin. ID del cliente del cual obtener el token |

### Headers

```
Authorization: Bearer <tu_token_de_acceso>
```

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "client_id": 7,
  "bearer_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "dtf:dbs:file:write"
}
```

### Ejemplos

#### Usuario Normal
```bash
curl -X GET "https://tu-api.com/johndeere/bearer-token" \
  -H "Authorization: Bearer tu_token_aqui"
```

#### Superadmin (Obtener token de otro cliente)
```bash
curl -X GET "https://tu-api.com/johndeere/bearer-token?target_client_id=7" \
  -H "Authorization: Bearer token_superadmin"
```

---

## 🟢 Endpoint Seedz

### `GET /seedz/bearer-token`

Obtiene el bearer token de OAuth de Seedz para el cliente del usuario autenticado.

### Requisitos

- ✅ Usuario autenticado con permisos de SEEDZ
- ✅ Usuario debe tener un `client_id` asignado
- ✅ El cliente debe tener credenciales de Seedz configuradas y activas

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `target_client_id` | `int` (query) | No | Solo para superadmin. ID del cliente del cual obtener el token |

### Headers

```
Authorization: Bearer <tu_token_de_acceso>
```

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "client_id": 7,
  "bearer_token": "token_de_seedz_aqui...",
  "token_type": "Bearer",
  "expires_in": null
}
```

### Ejemplos

#### Usuario Normal
```bash
curl -X GET "https://tu-api.com/seedz/bearer-token" \
  -H "Authorization: Bearer tu_token_aqui"
```

#### Superadmin (Obtener token de otro cliente)
```bash
curl -X GET "https://tu-api.com/seedz/bearer-token?target_client_id=7" \
  -H "Authorization: Bearer token_superadmin"
```

---

## 💻 Ejemplos de Uso

### JavaScript/TypeScript (Fetch API)

#### Obtener Token de John Deere
```javascript
async function getJohnDeereToken(accessToken) {
  const response = await fetch('https://tu-api.com/johndeere/bearer-token', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error obteniendo token');
  }
  
  const data = await response.json();
  return data.bearer_token;
}

// Uso
try {
  const token = await getJohnDeereToken('tu_token_de_acceso');
  console.log('Token de John Deere:', token);
} catch (error) {
  console.error('Error:', error.message);
}
```

#### Obtener Token de Seedz
```javascript
async function getSeedzToken(accessToken, targetClientId = null) {
  let url = 'https://tu-api.com/seedz/bearer-token';
  if (targetClientId) {
    url += `?target_client_id=${targetClientId}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error obteniendo token');
  }
  
  const data = await response.json();
  return data.bearer_token;
}

// Uso
try {
  const token = await getSeedzToken('tu_token_de_acceso');
  console.log('Token de Seedz:', token);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python (requests)

#### Obtener Token de John Deere
```python
import requests

def get_johndeere_token(access_token, target_client_id=None):
    url = "https://tu-api.com/johndeere/bearer-token"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    params = {}
    if target_client_id:
        params["target_client_id"] = target_client_id
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    
    data = response.json()
    return data["bearer_token"]

# Uso
try:
    token = get_johndeere_token("tu_token_de_acceso")
    print(f"Token de John Deere: {token}")
except requests.exceptions.HTTPError as e:
    print(f"Error: {e}")
```

#### Obtener Token de Seedz
```python
import requests

def get_seedz_token(access_token, target_client_id=None):
    url = "https://tu-api.com/seedz/bearer-token"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    params = {}
    if target_client_id:
        params["target_client_id"] = target_client_id
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    
    data = response.json()
    return data["bearer_token"]

# Uso
try:
    token = get_seedz_token("tu_token_de_acceso")
    print(f"Token de Seedz: {token}")
except requests.exceptions.HTTPError as e:
    print(f"Error: {e}")
```

### React/Next.js (Hook personalizado)

```typescript
import { useState } from 'react';

interface TokenResponse {
  success: boolean;
  client_id: number;
  bearer_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

export function useBearerToken(service: 'johndeere' | 'seedz') {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async (accessToken: string, targetClientId?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `https://tu-api.com/${service}/bearer-token`;
      if (targetClientId) {
        url += `?target_client_id=${targetClientId}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error obteniendo token');
      }
      
      const data: TokenResponse = await response.json();
      setToken(data.bearer_token);
      return data.bearer_token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { token, loading, error, fetchToken };
}

// Uso en componente
function MyComponent() {
  const { token, loading, error, fetchToken } = useBearerToken('johndeere');
  const accessToken = 'tu_token_de_acceso'; // Obtener del contexto/auth

  const handleGetToken = async () => {
    try {
      await fetchToken(accessToken);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <button onClick={handleGetToken} disabled={loading}>
        {loading ? 'Obteniendo token...' : 'Obtener Token'}
      </button>
      {token && <p>Token: {token.substring(0, 20)}...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
```

---

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| `200` | ✅ Éxito - Token obtenido correctamente |
| `400` | ❌ Solicitud inválida (client_id inválido, superadmin sin target_client_id) |
| `401` | ❌ No autenticado o token inválido |
| `403` | ❌ Sin permisos o credenciales inactivas |
| `404` | ❌ Credenciales no encontradas para el cliente |
| `500` | ❌ Error del servidor o error al obtener token de OAuth |
| `504` | ❌ Timeout al comunicarse con el servicio OAuth |

### Ejemplos de Respuestas de Error

#### 400 Bad Request
```json
{
  "detail": "Superadmin debe especificar target_client_id para obtener token de un cliente específico"
}
```

#### 403 Forbidden
```json
{
  "detail": "Las credenciales de John Deere para el cliente 7 están inactivas"
}
```

#### 404 Not Found
```json
{
  "detail": "No se encontraron credenciales de John Deere para el cliente 7"
}
```

#### 500 Internal Server Error
```json
{
  "detail": "Error obteniendo token OAuth de John Deere: [mensaje de error]"
}
```

### Manejo de Errores en JavaScript

```javascript
async function getTokenSafely(service, accessToken, targetClientId = null) {
  try {
    let url = `https://tu-api.com/${service}/bearer-token`;
    if (targetClientId) {
      url += `?target_client_id=${targetClientId}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 400:
          throw new Error(`Solicitud inválida: ${error.detail}`);
        case 401:
          throw new Error('No autenticado. Verifica tu token de acceso.');
        case 403:
          throw new Error(`Sin permisos: ${error.detail}`);
        case 404:
          throw new Error(`Credenciales no encontradas: ${error.detail}`);
        case 500:
          throw new Error(`Error del servidor: ${error.detail}`);
        case 504:
          throw new Error('Timeout al comunicarse con el servicio OAuth');
        default:
          throw new Error(`Error ${response.status}: ${error.detail}`);
      }
    }
    
    const data = await response.json();
    return data.bearer_token;
    
  } catch (error) {
    console.error(`Error obteniendo token de ${service}:`, error);
    throw error;
  }
}
```

---

## 📝 Notas Importantes

### Para Usuarios Normales

- ✅ **No necesitas** especificar `target_client_id`
- ✅ Obtienes automáticamente el token de **tu propio cliente**
- ✅ El `client_id` se determina automáticamente desde tu token de acceso

### Para Superadmins

- ✅ Puedes especificar `target_client_id` para obtener el token de **cualquier cliente**
- ⚠️ Si no especificas `target_client_id` y tienes un cliente asignado, obtienes el token de tu cliente
- ⚠️ Si no especificas `target_client_id` y **no** tienes cliente asignado, recibirás un error 400

### Validez de los Tokens

- **John Deere**: Los tokens suelen expirar en 3600 segundos (1 hora). Verifica `expires_in` en la respuesta.
- **Seedz**: Los tokens pueden no tener expiración definida (`expires_in: null`). Consulta la documentación de Seedz para más detalles.

### Mejores Prácticas

1. **Cachear tokens**: Los tokens tienen validez limitada, pero puedes cachearlos mientras sean válidos para evitar llamadas innecesarias.
2. **Manejar expiración**: Implementa lógica para renovar tokens antes de que expiren.
3. **Manejar errores**: Siempre maneja los errores apropiadamente y muestra mensajes claros al usuario.
4. **No exponer tokens**: Nunca expongas los bearer tokens en el frontend o en logs públicos.

---

## 🔗 Endpoints Relacionados

- `GET /johndeere/credentials` - Obtener credenciales de John Deere (sin token)
- `GET /seedz/credentials` - Obtener credenciales de Seedz (sin token)
- `POST /auth/login` - Obtener token de acceso para autenticación

---

**Última actualización:** 2026-02-12
