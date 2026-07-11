import { api } from './api.js';

export async function login(email, password) {
    try {
        const data = await api.post('/auth/login', { email, password });
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario)); 
        
        return data.usuario;
    } catch (error) {
        throw error; 
    }
}

export function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}
