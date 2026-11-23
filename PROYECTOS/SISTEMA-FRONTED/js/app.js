import { renderResumen } from './views/resumen.js';
//app.js
import { getUser, login } from './auth.js';
import { renderInventario } from './views/inventario.js';
import { renderUsuarios } from './views/usuarios.js';
import { renderVentas } from './views/ventas.js';
import { renderMovimientos } from './views/movimientos.js';
import { renderClientes } from './views/clientes.js';
import { renderProveedores } from './views/proveedores.js';
import { renderPerfil } from './views/perfil.js';
import { renderConfiguracion } from './views/configuracion.js';
import { renderAuditoria } from './views/auditoria.js'; 
import { renderNuevaVenta } from './views/nueva_venta.js'; 

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
        <div class="login-screen d-flex justify-content-center align-items-center vh-100 bg-dark">
            <div class="card p-4 shadow" style="width: 350px;">
                <div class="login-brand"><span class="brand-mark">i</span> ICA<span class="brand-accent">Market</span></div><h3 class="mb-2">Bienvenido de nuevo</h3><p class="text-muted mb-4">Ingresa para administrar tu tienda.</p>
                <form id="login-form">
                    <div class="mb-3">
                        <input type="email" id="email" class="form-control" aria-label="Correo electrónico" placeholder="Correo electrónico" autocomplete="username" required>
                    </div>
                    <div class="mb-3">
                        <input type="password" id="password" class="form-control" aria-label="Contraseña" placeholder="Contraseña" autocomplete="current-password" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Ingresar al sistema <span aria-hidden="true">→</span></button>
                    <p id="login-error" class="text-danger mt-3 mb-0" role="alert"></p>
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
            document.getElementById('login-error').textContent = error.message;
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
                    <h4><span class="brand-mark">i</span> ICA<span class="brand-accent">Market</span></h4><small>VENTAS · INVENTARIO</small>
                </div>

                <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu-principal">Menú <span aria-hidden="true">☰</span></button>
                <ul id="menu-principal" class="nav flex-column">
                    <li class="nav-item">
                        <a href="#dashboard" class="nav-link active">
                            <i class="fas fa-chart-pie me-2"></i> Estadísticas
                        </a>
                    </li>

                    ${(esAdmin || esCajero) ? `
                    <li class="nav-item mt-3">
                        <span class="nav-group">Comercial</span>
                        <ul class="nav flex-column ps-3 mt-2">
                            <li><a href="#ventas" class="nav-link"><span class="dot bg-success"></span> Ventas</a></li>
                            <li><a href="#clientes" class="nav-link"><span class="dot bg-warning"></span> Clientes</a></li>
                        </ul>
                    </li>
                    ` : ''}

                    ${(esAdmin || esAlmacen) ? `
                    <li class="nav-item mt-3">
                        <span class="nav-group">Logística</span>
                        <ul class="nav flex-column ps-3 mt-2">
                            <li><a href="#inventario" class="nav-link"><span class="dot bg-primary"></span> Productos</a></li>
                            <li><a href="#movimientos" class="nav-link"><span class="dot bg-info"></span> Kardex </a></li>
                            <li><a href="#proveedores" class="nav-link"><span class="dot bg-secondary"></span> Proveedores</a></li> </ul>
                    </li>
                    ` : ''}

                    ${esAdmin ? `
                    <li class="nav-item mt-3">
                        <span class="nav-group">Administración</span>
                        <ul class="nav flex-column ps-3 mt-2">
                            <li><a href="#usuarios" class="nav-link"><span class="dot bg-danger"></span> Usuarios</a></li>
                            <li><a href="#auditoria" class="nav-link"><span class="dot bg-dark"></span> Historial de Precios</a></li>
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
    const renderHomeCards = () => renderResumen(viewContent, user.rol);

    const viewContent = document.getElementById('view-content');

    const menuToggle = app.querySelector('.menu-toggle');
    const cerrarMenu = () => menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.onclick = () => menuToggle.setAttribute('aria-expanded',
        String(menuToggle.getAttribute('aria-expanded') !== 'true'));
    const nav = app.querySelector('.sidebar');
    nav.addEventListener('click', event => {
        if (event.target.closest('a[href]')) cerrarMenu();
    });
    nav.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
            cerrarMenu();
            menuToggle.focus();
        }
    });

    const routerDinamico = () => {
        cerrarMenu();
        const hash = window.location.hash || '#dashboard';
        
        document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
        const botonActivo = Array.from(document.querySelectorAll('.sidebar a')).find(link => link.hash === hash);
        if (botonActivo) {
            botonActivo.classList.add('active');
        }

        if ((esAlmacen && ['#ventas','#nueva-venta','#clientes'].includes(hash)) ||
            (esCajero && ['#movimientos','#proveedores','#inventario'].includes(hash))) {
            location.replace('#dashboard');
            return;
        }
        switch (hash) {
            case '#dashboard':
                renderHomeCards();
                break;
            case '#ventas':
                renderVentas(viewContent);
                break;
            case '#nueva-venta':
                renderNuevaVenta(viewContent);
                break;
            case '#clientes':
                renderClientes(viewContent);
                break;
            case '#inventario':
                renderInventario(viewContent);
                break;
            case '#movimientos':
                renderMovimientos(viewContent);
                break;
            case '#proveedores':
                renderProveedores(viewContent);
                break;
            case '#usuarios':
                if (esAdmin) renderUsuarios(viewContent);
                else renderHomeCards(); 
                break;
            case '#auditoria':
                if (esAdmin) renderAuditoria(viewContent);
                else renderHomeCards();
                break;
            case '#perfil':
                renderPerfil(viewContent);
                break;
            case '#configuracion':
                renderConfiguracion(viewContent);
                break;
            default:
                renderHomeCards(); 
        }
    };

    window.onhashchange = routerDinamico;

    routerDinamico();
    
    document.getElementById('logout-header')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.onhashchange = null;
        history.replaceState(null, '', location.pathname);
        localStorage.clear();
        router();
    });

    document.getElementById('logout')?.addEventListener('click', () => {
        window.onhashchange = null;
        history.replaceState(null, '', location.pathname);
        localStorage.clear();
        router();
    });
}


router();