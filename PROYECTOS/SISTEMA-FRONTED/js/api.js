const BASE_URL = 'https://baseii.onrender.com/api';

async function customFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    // Headers: si el body es FormData, NO ponemos Content-Type
    const headers = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    // Si el body NO es FormData y existe, entonces es JSON
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers,
        body: options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined)
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
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
    post: (endpoint, body) => customFetch(endpoint, { method: 'POST', body }),
    put: (endpoint, body) => customFetch(endpoint, { method: 'PUT', body }),
    patch: (endpoint, body) => customFetch(endpoint, { method: 'PATCH', body }),
    delete: (endpoint) => customFetch(endpoint, { method: 'DELETE' }),
    postForm: (endpoint, formData) => customFetch(endpoint, { method: 'POST', body: formData }),
    putForm: (endpoint, formData) => customFetch(endpoint, { method: 'PUT', body: formData })
};