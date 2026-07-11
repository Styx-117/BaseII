export const login = async (email, password) => {
    const response = await fetch('https://baseii.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Credenciales inválidas');

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.usuario));
    return data;
};

export const getUser = () => JSON.parse(localStorage.getItem('user'));