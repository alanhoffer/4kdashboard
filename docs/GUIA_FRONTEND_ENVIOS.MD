# 🔄 Flujo del DTF Agent - ¿A dónde envía los archivos?

## 📋 Respuesta Corta

**El DTF Agent envía los archivos DIRECTAMENTE a John Deere y SEEDZ.**

**FourK API solo se usa para:**
- ✅ Autenticación (obtener token JWT)
- ✅ Obtener credenciales de John Deere/SEEDZ
- ✅ Obtener order_ids y transfer_ids (para PartsData)
- ✅ Marcar orders/transfers como enviados
- ✅ Crear logs de envío

**NO se envían los archivos a FourK API.**

---

## 🔍 Flujo Detallado del DTF Agent

### Paso 1: Autenticación con FourK API
```
DTF Agent → POST https://fourk-api.../auth/login
           → Obtiene token JWT
```

**Código:** `services/auth.py` → `AuthService.get_token()`

---

### Paso 2: Obtener Credenciales desde FourK API
```
DTF Agent → GET https://fourk-api.../rpm/credentials
           → Obtiene: dealer_id, johndeere_client_id, secret_id
```

**Código:** `services/credentials.py` → `CredentialsService.get_credentials()`

---

### Paso 3: Obtener Token OAuth de John Deere
```
DTF Agent → POST https://sso.johndeere.com/oauth2/.../token
           → Usa credenciales obtenidas en Paso 2
           → Obtiene token OAuth de John Deere
```

**Código:** `services/oauth.py` → `OAuthService.get_johndeere_token()`

---

### Paso 4: Envío DIRECTO a John Deere
```
DTF Agent → PUT https://servicesext.deere.com/dtfapi/dbs/dealer/{dealer_id}/files
           → Headers: Authorization: Bearer {token_oauth_john_deere}
           → Body: Archivo binario
           → ✅ ENVÍO DIRECTO, NO pasa por FourK API
```

**Código:** `services/direct_upload.py` → `DirectUploadService.send_to_johndeere()`

---

### Paso 5: (Opcional) Obtener IDs para PartsData
Si es archivo PartsData:
```
DTF Agent → GET https://fourk-api.../rpm/orders/processed
           → Obtiene order_ids

DTF Agent → GET https://fourk-api.../rpm/transfers/processed
           → Obtiene transfer_ids
```

**Código:** `services/credentials.py` → `CredentialsService.get_partsdata_ids()`

---

### Paso 6: (Opcional) Marcar Orders/Transfers como Enviados
Si es PartsData y el envío fue exitoso:
```
DTF Agent → PUT https://fourk-api.../rpm/orders/mark-sent
           → Marca orders como enviados

DTF Agent → PUT https://fourk-api.../rpm/transfers/mark-sent
           → Marca transfers como enviados
```

**Código:** `services/credentials.py` → `mark_orders_as_sent()`, `mark_transfers_as_sent()`

---

### Paso 7: Crear Log en FourK API
```
DTF Agent → POST https://fourk-api.../rpm/logs
           → Crea log del envío
```

**Código:** `services/remote_logging.py` → `RemoteLoggingService.create_log()`

---

## 🔄 Flujo Completo Visual

```
┌─────────────────────────────────────────────────────────────┐
│ DTF Agent (file_sender.py)                                  │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Autenticación                                            │
│    POST /auth/login → FourK API                             │
│    → Obtiene token JWT                                      │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Obtener Credenciales                                     │
│    GET /rpm/credentials → FourK API                         │
│    → dealer_id, johndeere_client_id, secret_id            │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Obtener Token OAuth                                      │
│    POST /oauth2/.../token → John Deere                      │
│    → Usa credenciales del paso 2                            │
│    → Obtiene token OAuth                                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ENVÍO DIRECTO DEL ARCHIVO                                │
│    PUT /dtfapi/dbs/dealer/{dealer_id}/files → John Deere   │
│    → Headers: Authorization: Bearer {token_oauth}          │
│    → Body: Archivo binario                                  │
│    ✅ NO pasa por FourK API                                 │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. (Si es PartsData) Obtener IDs                            │
│    GET /rpm/orders/processed → FourK API                    │
│    GET /rpm/transfers/processed → FourK API                 │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. (Si es PartsData) Marcar como Enviados                  │
│    PUT /rpm/orders/mark-sent → FourK API                    │
│    PUT /rpm/transfers/mark-sent → FourK API                 │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Crear Log                                                │
│    POST /rpm/logs → FourK API                               │
│    → Registra el envío                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔵 Flujo para SEEDZ

Similar a John Deere, pero:

1. **Obtener credenciales:**
   ```
   GET /seedz/credentials → FourK API
   → client_id_seedz, client_secret
   ```

2. **Obtener token:**
   ```
   POST /integration/v1/auth → SEEDZ API
   → Usa credenciales del paso 1
   → Obtiene token OAuth
   ```

3. **Envío DIRECTO:**
   ```
   POST /integration/v1/{file_type} → SEEDZ API
   → Headers: Authorization: Bearer {token_oauth_seedz}
   → Body: JSON (convierte CSV a JSON automáticamente)
   → ✅ NO pasa por FourK API
   ```

---

## 📊 Resumen: ¿Qué va a FourK API y qué va directo?

| Operación | Destino | Propósito |
|-----------|---------|-----------|
| Autenticación | FourK API | Obtener token JWT |
| Obtener credenciales | FourK API | Obtener credenciales de John Deere/SEEDZ |
| Obtener token OAuth | John Deere/SEEDZ | Obtener token para enviar archivos |
| **Enviar archivo** | **John Deere/SEEDZ** | **✅ ENVÍO DIRECTO** |
| Obtener order_ids/transfer_ids | FourK API | Para PartsData |
| Marcar como enviados | FourK API | Actualizar estado en BD |
| Crear log | FourK API | Registrar envío |

---

## 🔑 Puntos Clave

1. **Los archivos NO pasan por FourK API**
   - Se envían directamente a John Deere o SEEDZ
   - FourK API solo proporciona credenciales

2. **FourK API es un servicio de gestión**
   - Almacena credenciales
   - Gestiona orders/transfers
   - Registra logs
   - NO procesa ni almacena los archivos

3. **El DTF Agent es independiente**
   - Puede funcionar sin FourK API para el envío
   - Solo necesita FourK API para obtener credenciales y registrar logs

---

## 📝 Código Relevante

- **Autenticación:** `services/auth.py`
- **Credenciales:** `services/credentials.py`
- **OAuth:** `services/oauth.py`
- **Envío directo:** `services/direct_upload.py`
- **Orquestación:** `file_sender.py` → `services/uploaders.py`

---

**Última actualización:** 2025-02-06
