const BASE_URL = 'https://baseii.onrender.com/api';

async function customFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (response.status === 401) {
        localStorage.clear();
        window.location.reload(); 
        throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
    }
    
    if (response.status === 403) {
        throw new Error(data.error || 'No tienes permisos para realizar esta acción.');
    }

    if (!response.ok) throw new Error(data.error || 'Error en la petición');
    return data;
}

export const api = {
    get: (endpoint) => customFetch(endpoint),
    post: (endpoint, body) => customFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => customFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (endpoint, body) => customFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint) => customFetch(endpoint, { method: 'DELETE' })
};
