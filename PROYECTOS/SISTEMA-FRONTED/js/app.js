//app.js
import { api } from './api.js';
import { getUser, login } from './auth.js';
import { renderInventario } from './views/inventario.js';
import { renderUsuarios } from './views/usuarios.js';
import { renderVentas } from './views/ventas.js';
import { renderMovimientos } from './views/movimientos.js';
import { renderClientes } from './views/clientes.js';
import { renderProveedores } from './views/proveedores.js';

const app = document.getElementById('app');

function router() {
    const user = getUser();
    const token = localStorage.getItem('token');

    if (token && user) {
        renderDashboard(user);
    } else {
        renderLogin();
    }
}

function renderLogin() {
    app.innerHTML = `
        <div class="d-flex justify-content-center align-items-center vh-100 bg-dark">
            <div class="card p-4 shadow" style="width: 350px;">
                <h3 class="text-center mb-4">Iniciar Sesión</h3>
                <form id="login-form">
                    <div class="mb-3">
                        <input type="email" id="email" class="form-control" placeholder="Email" required>
                    </div>
                    <div class="mb-3">
                        <input type="password" id="password" class="form-control" placeholder="Contraseña" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Entrar</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await login(email, password);
            router();
        } catch (error) {
            alert("Credenciales incorrectas: " + error.message);
        }
    });
}

function renderDashboard(user) {
    // Determinar color e ícono según género (fallback si no hay imagen)
    const esMujer = user.genero === 'F' || user.genero === 'Mujer';
    const colorAvatar = esMujer ? '#e83e8c' : '#0d6efd';
    const iconoAvatar = esMujer ? 'fas fa-female' : 'fas fa-user';

    // Si el usuario tiene imagen, la usamos; si no, mostramos el ícono
    const imagenUsuario = user.imagen_url || null;

    const esAdmin = user.rol === 'ADMIN';
    const esCajero = user.rol === 'CAJERO';
    const esAlmacen = user.rol === 'ALMACENERO';

    app.innerHTML = `
        <div class="d-flex bg-light vh-100 overflow-hidden">
            <nav class="sidebar p-3 overflow-auto" style="min-width: 260px;">
                <div class="brand-logo mb-4 px-2">
                    <h4>SISTEMA BD</h4>
                </div>

                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a href="#dashboard" class="nav-link active">
                            <i class="fas fa-chart-pie me-2"></i> Estadísticas
                        </a>
                    </li>

                    ${(esAdmin || esCajero) ? `
                    <li class="nav-item mt-3">
                        <a href="#" class="nav-link text-muted small text-uppercase fw-bold">Comercial</a>
                        <ul class="nav flex-column ps-3 mt-2">
                            <li><a href="#ventas" class="nav-link"><span class="dot bg-success"></span> Ventas</a></li>
                            <li><a href="#clientes" class="nav-link"><span class="dot bg-warning"></span> Clientes</a></li>
                        </ul>
                    </li>
                    ` : ''}

                    ${(esAdmin || esAlmacen) ? `
                    <li class="nav-item mt-3">
                        <a href="#" class="nav-link text-muted small text-uppercase fw-bold">Logística</a>
                        <ul class="nav flex-column ps-3 mt-2">
                            <li><a href="#inventario" class="nav-link"><span class="dot bg-primary"></span> Productos</a></li>
                            <li><a href="#movimientos" class="nav-link"><span class="dot bg-info"></span> Kardex </a></li>
                            <li><a href="#proveedores" class="nav-link"><span class="dot bg-secondary"></span> Proveedores</a></li> </ul>
                    </li>
                    ` : ''}

                    ${esAdmin ? `
                    <li class="nav-item mt-3">
                        <a href="#" class="nav-link text-muted small text-uppercase fw-bold">Administración</a>
                        <ul class="nav flex-column ps-3 mt-2">
                            <li><a href="#usuarios" class="nav-link"><span class="dot bg-danger"></span> Usuarios</a></li>
                        </ul>
                    </li>
                    ` : ''}

                    <li class="nav-item mt-auto pt-5">
                        <button id="logout" class="btn btn-outline-light btn-sm w-100 mt-5">
                            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                        </button>
                    </li>
                </ul>
            </nav>

            <main class="flex-grow-1 p-4 overflow-auto">
                <header class="d-flex justify-content-end mb-4">
                    <div class="dropdown">
                        <div class="d-flex align-items-center dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer; user-select: none;">
                            <span class="me-3">Bienvenido, <b>${user.nombre_completo || 'Administrador'}</b></span>
                            <!-- Avatar: si hay imagen, la mostramos; si no, el icono -->
                            ${imagenUsuario ? `
                            <img src="${imagenUsuario}" alt="Avatar" class="rounded-circle" style="width: 42px; height: 42px; object-fit: cover;">
                            ` : `
                            <div class="shadow-sm text-white" style="background-color: ${colorAvatar}; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <i class="${iconoAvatar} fs-5"></i>
                            </div>
                            `}
                        </div>

                        <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" style="min-width: 200px;">
                            <li class="px-3 py-2 text-center">
                                <span class="d-block fw-bold">${user.nombre_completo || 'Admin'}</span>
                                <small class="text-muted">${user.rol || 'Administrador'}</small>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item py-2" href="#perfil">
                                    <i class="fas fa-user-edit me-2 text-muted"></i> Editar Perfil
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item py-2" href="#configuracion">
                                    <i class="fas fa-cog me-2 text-muted"></i> Configuración
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item text-danger py-2 fw-bold" href="#" id="logout-header">
                                    <i class="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                                </a>
                            </li>
                        </ul>
                    </div>
                </header>

                <div id="view-content">
                </div>
            </main>
        </div>
    `;

    // ========== Lógica de las vistas ==========
    const renderHomeCards = async () => {
        const viewContent = document.getElementById('view-content');
        viewContent.innerHTML = `
            <h4 class="mb-4 text-dark fw-bold">Resumen del Sistema</h4>
            <div class="row g-4 mb-4">
                <div class="col-md-6 col-xl-4">
                    <div class="card p-4 border-0 shadow-sm h-100">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1 small text-uppercase fw-bold">Personal Activo</h6>
                                <h3 class="fw-bold mb-0" id="dash-usuarios"><i class="fas fa-spinner fa-spin fs-5 text-muted"></i></h3>
                            </div>
                            <div class="icon-box bg-primary text-white shadow-sm" style="width: 55px; height: 55px; border-radius: 15px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-users fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-4">
                    <div class="card p-4 border-0 shadow-sm h-100">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-1 small text-uppercase fw-bold">Ingresos Totales</h6>
                                <h3 class="fw-bold mb-0 text-success" id="dash-ingresos"><i class="fas fa-spinner fa-spin fs-5 text-muted"></i></h3>
                            </div>
                            <div class="icon-box bg-success text-white shadow-sm" style="width: 55px; height: 55px; border-radius: 15px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-hand-holding-usd fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-8">
                    <div class="card border-0 shadow-sm p-4">
                        <h6 class="fw-bold text-muted mb-4">Ingresos de los últimos 7 días</h6>
                        <canvas id="ventasChart" height="100"></canvas>
                    </div>
                </div>
            </div>
        `;

        try {
            const stats = await api.get('/dashboard/stats');

            document.getElementById('dash-usuarios').innerText = stats.usuarios;
            document.getElementById('dash-ingresos').innerText = 'S/ ' + stats.ingresos.toFixed(2);

            const etiquetasFechas = stats.grafica.map(item => {
                const date = new Date(item.fecha);
                return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
            });
            const totalesSoles = stats.grafica.map(item => parseFloat(item.total_dia));

            const ctx = document.getElementById('ventasChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: etiquetasFechas.length > 0 ? etiquetasFechas : ['Sin datos recientes'],
                    datasets: [{
                        label: 'Ventas (S/)',
                        data: totalesSoles.length > 0 ? totalesSoles : [0],
                        backgroundColor: '#0d6efd',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return ' S/ ' + context.parsed.y.toFixed(2);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { borderDash: [5, 5] }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });

        } catch (err) {
            console.error("Error cargando dashboard:", err);
            document.getElementById('dash-usuarios').innerText = '-';
            document.getElementById('dash-ingresos').innerText = '-';
        }
    };

    const viewContent = document.getElementById('view-content');

    // Cargar el dashboard inicial
    renderHomeCards();

    // Navegación
    document.querySelector('a[href="#usuarios"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderUsuarios(viewContent);
    });

    document.querySelector('a[href="#ventas"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderVentas(viewContent);
    });

    document.querySelector('a[href="#movimientos"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderMovimientos(viewContent);
    });

    document.querySelector('a[href="#inventario"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderInventario(viewContent);
    });

    document.querySelector('a[href="#clientes"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderClientes(viewContent);
    });

    document.querySelector('a[href="#proveedores"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderProveedores(viewContent);
    });

    document.querySelector('a[href="#dashboard"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        renderHomeCards();
    });

    // Cerrar sesión
    document.getElementById('logout-header').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        router();
    });

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.clear();
        router();
    });
}

// Iniciar la aplicación
router();