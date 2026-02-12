// API Base URL - puede ser configurado con variable de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fourk-api.icyrock-7ac226d0.brazilsouth.azurecontainerapps.io';

/**
 * Helper para hacer requests autenticados a la API
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  // No incluir Content-Type si el body es FormData (el browser lo hace automáticamente)
  const isFormData = options.body instanceof FormData;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };
  
  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  // Si token expirado, intentar refresh
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // Reintentar la petición con el nuevo token
      const newToken = localStorage.getItem('access_token');
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${newToken}`
      };
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } else {
      // Si el refresh falla, lanzar error
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
  }
  
  return response;
}

/**
 * Renueva el token de acceso usando el refresh token
 */
export async function refreshToken(): Promise<boolean> {
  const refreshTokenValue = localStorage.getItem('refresh_token');
  if (!refreshTokenValue) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshTokenValue })
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
  
  // Si falla refresh, limpiar tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  return false;
}

/**
 * Login - Inicia sesión y obtiene tokens
 */
export async function login(email: string, password: string) {
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
}

/**
 * Logout - Limpia los tokens
 */
export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

/**
 * Obtiene información del usuario autenticado
 */
export async function getCurrentUser() {
  const response = await apiRequest('/auth/me');
  
  if (!response.ok) {
    throw new Error('Error obteniendo información del usuario');
  }
  
  return await response.json();
}

/**
 * Verifica si el usuario tiene acceso a una aplicación específica
 */
export async function checkAppAccess(appName: string): Promise<boolean> {
  try {
    const response = await apiRequest(`/auth/check-app-access/${appName}`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.has_access === true;
  } catch (error) {
    console.error('Error checking app access:', error);
    return false;
  }
}

/**
 * Maneja errores de la API de forma consistente
 */
export async function handleApiError(response: Response) {
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

/**
 * Obtiene credenciales de RPM desde FourK API
 */
export async function getRpmCredentials() {
  const response = await apiRequest('/rpm/credentials');
  if (!response.ok) {
    throw new Error('Error obteniendo credenciales RPM');
  }
  return await response.json();
}

/**
 * Obtiene credenciales de ELIPS desde FourK API
 */
export async function getElipsCredentials() {
  const response = await apiRequest('/elips/credentials');
  if (!response.ok) {
    throw new Error('Error obteniendo credenciales ELIPS');
  }
  return await response.json();
}

/**
 * Obtiene credenciales de SEEDZ desde FourK API
 */
export async function getSeedzCredentials() {
  const response = await apiRequest('/seedz/credentials');
  if (!response.ok) {
    throw new Error('Error obteniendo credenciales SEEDZ');
  }
  return await response.json();
}

/**
 * Obtiene token OAuth de John Deere usando endpoint de FourK API
 * GET /johndeere/bearer-token
 */
export async function getJohnDeereOAuthToken(credentials: any, targetClientId?: number): Promise<string> {
  try {
    let url = '/johndeere/bearer-token';
    if (targetClientId) {
      url += `?target_client_id=${targetClientId}`;
    }
    
    const response = await apiRequest(url, {
      method: 'GET',
    });
    
    if (!response.ok) {
      let errorMessage = 'Error obteniendo token OAuth de John Deere';
      try {
        const error = await response.json();
        // El error puede venir en diferentes formatos
        if (error.detail) {
          errorMessage = error.detail;
        } else if (error.error_description) {
          errorMessage = `${error.error}: ${error.error_description}`;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
      } catch (e) {
        // Si no se puede parsear, usar el texto de la respuesta
        const text = await response.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            errorMessage = parsed.detail || parsed.error_description || parsed.error || text;
          } catch {
            errorMessage = text || `Error ${response.status}: ${response.statusText}`;
          }
        }
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data.bearer_token;
  } catch (error: any) {
    // Si el error ya tiene un mensaje descriptivo, solo pasarlo
    if (error.message && !error.message.includes('Error obteniendo token OAuth de John Deere:')) {
      throw error;
    }
    throw new Error(`Error obteniendo token OAuth de John Deere: ${error.message}`);
  }
}

/**
 * Obtiene token OAuth de SEEDZ usando endpoint de FourK API
 * GET /seedz/bearer-token
 */
export async function getSeedzOAuthToken(credentials: any, targetClientId?: number): Promise<string> {
  try {
    let url = '/seedz/bearer-token';
    if (targetClientId) {
      url += `?target_client_id=${targetClientId}`;
    }
    
    const response = await apiRequest(url, {
      method: 'GET',
    });
    
    if (!response.ok) {
      let errorMessage = 'Error obteniendo token OAuth de SEEDZ';
      try {
        const error = await response.json();
        if (error.detail) {
          errorMessage = error.detail;
        } else if (error.error_description) {
          errorMessage = `${error.error}: ${error.error_description}`;
        } else if (error.error) {
          errorMessage = error.error;
        }
      } catch (e) {
        const text = await response.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            errorMessage = parsed.detail || parsed.error_description || parsed.error || text;
          } catch {
            errorMessage = text || `Error ${response.status}: ${response.statusText}`;
          }
        }
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data.bearer_token;
  } catch (error: any) {
    if (error.message && !error.message.includes('Error obteniendo token OAuth de SEEDZ:')) {
      throw error;
    }
    throw new Error(`Error obteniendo token OAuth de SEEDZ: ${error.message}`);
  }
}

/**
 * Envía archivo a John Deere usando endpoint de FourK API
 * El backend maneja todo el proceso (OAuth, envío, etc.)
 */
export async function sendFileToJohnDeere(
  file: File,
  fileType: 'pmm' | 'partsdata' | 'elips',
  targetClientId?: number
): Promise<any> {
  let endpoint = '';
  
  if (fileType === 'pmm') {
    endpoint = '/rpm/pmm/send-to-johndeere';
  } else if (fileType === 'partsdata') {
    endpoint = '/rpm/partsdata/send-to-johndeere';
  } else if (fileType === 'elips') {
    endpoint = '/elips/send-to-johndeere';
  } else {
    throw new Error('Tipo de archivo no válido');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  if (targetClientId) {
    formData.append('target_client_id', targetClientId.toString());
  }
  
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error enviando archivo' }));
    throw new Error(error.detail || 'Error enviando archivo a John Deere');
  }
  
  return await response.json();
}

/**
 * Envía archivo a SEEDZ usando endpoint de FourK API
 * El backend maneja todo el proceso (OAuth, envío, conversión CSV, etc.)
 */
export async function sendFileToSeedz(
  file: File,
  seedzFileType: string,
  targetClientId?: number
): Promise<any> {
  // Mapear tipos de SEEDZ a endpoints
  const endpoint = `/seedz/${seedzFileType}`;
  
  const formData = new FormData();
  formData.append('file', file);
  if (targetClientId) {
    formData.append('target_client_id', targetClientId.toString());
  }
  
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error enviando archivo' }));
    throw new Error(error.detail || 'Error enviando archivo a SEEDZ');
  }
  
  return await response.json();
}

/**
 * Obtiene order_ids procesados desde FourK API
 */
export async function getProcessedOrderIds() {
  const response = await apiRequest('/rpm/orders/processed');
  if (!response.ok) {
    throw new Error('Error obteniendo order_ids procesados');
  }
  return await response.json();
}

/**
 * Obtiene transfer_ids procesados desde FourK API
 */
export async function getProcessedTransferIds() {
  const response = await apiRequest('/rpm/transfers/processed');
  if (!response.ok) {
    throw new Error('Error obteniendo transfer_ids procesados');
  }
  return await response.json();
}

/**
 * Marca orders como enviados
 */
export async function markOrdersAsSent(orderIds: string[]) {
  const response = await apiRequest('/rpm/orders/mark-sent', {
    method: 'PUT',
    body: JSON.stringify({ order_ids: orderIds }),
  });
  if (!response.ok) {
    throw new Error('Error marcando orders como enviados');
  }
  return await response.json();
}

/**
 * Marca transfers como enviados
 */
export async function markTransfersAsSent(transferIds: string[]) {
  const response = await apiRequest('/rpm/transfers/mark-sent', {
    method: 'PUT',
    body: JSON.stringify({ transfer_ids: transferIds }),
  });
  if (!response.ok) {
    throw new Error('Error marcando transfers como enviados');
  }
  return await response.json();
}

/**
 * Crea log de envío en FourK API
 */
export async function createLog(logData: {
  file_type: string;
  filename: string;
  client_id: number;
  success: boolean;
  message?: string;
  error?: string;
}) {
  const response = await apiRequest('/rpm/logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  });
  if (!response.ok) {
    console.error('Error creando log:', await response.text());
    // No lanzar error, solo loguear
  }
  return response.ok ? await response.json() : null;
}

/**
 * Modifica archivo PartsData agregando order_ids y transfer_ids en la primera línea
 */
export async function modifyPartsDataFile(
  file: File,
  orderIds: string[],
  transferIds: string[]
): Promise<File> {
  const fileContent = await file.text();
  const idsLine = `ORDER\t${orderIds.join(',')}\tTRNSFR\t${transferIds.join(',')}\n`;
  const modifiedContent = idsLine + fileContent;
  
  return new File([modifiedContent], file.name, { type: file.type });
}

export { API_BASE_URL };
