import { api } from '../api.js';
import { getUser } from '../auth.js';

export async function renderUsuarios(container) {
    const user = getUser();

    if (user.rol !== 'ADMIN') {
        container.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100 mt-5">
                <div class="alert alert-danger shadow-sm text-center p-4" style="max-width: 400px;">
                    <i class="fas fa-user-shield fs-1 text-danger mb-3"></i>
                    <h5 class="fw-bold">Acceso Denegado</h5>
                    <p class="mb-0">Esta sección es de uso exclusivo para el Administrador del sistema.</p>
                </div>
            </div>
        `;
        return; 
    }

    container.innerHTML = `
        <div class="d-flex justify-content-between mb-4 align-items-center">
            <h3><i class="fas fa-user-cog text-danger me-2"></i> Control de Personal (Usuarios)</h3>
            <button class="btn btn-danger fw-bold shadow-sm" id="btn-nuevo-usuario">
                <i class="fas fa-plus"></i> Registrar Colaborador
            </button>
        </div>

        <div class="modal fade" id="modalUsuario" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="form-usuario">
                        <input type="hidden" id="usuario-id">
                        
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title fw-bold" id="modal-usuario-titulo">Registrar Colaborador</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label small text-muted">Nombre Completo</label>
                                <input type="text" id="nombre_usuario" class="form-control" placeholder="Ej: Mayra Saravia" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small text-muted">Correo Electrónico (Login)</label>
                                <input type="email" id="email_usuario" class="form-control" placeholder="ejemplo@wowdash.com" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small text-muted">Contraseña</label>
                                <input type="password" id="password_usuario" class="form-control" placeholder="Mínimo 6 caracteres">
                                <small class="text-muted" id="password-helper" style="font-size: 0.75rem;">Al editar, déjalo en blanco si no deseas cambiarla.</small>
                            </div>
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label class="form-label small text-muted">Rol en el Sistema</label>
                                    <select id="rol_usuario" class="form-select" required>
                                        <option value="ADMIN">Administrador</option>
                                        <option value="CAJERO">Cajero</option>
                                        <option value="ALMACENERO">Almacenero</option>
                                    </select>
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label small text-muted">Género (Avatar)</label>
                                    <select id="genero_usuario" class="form-select" required>
                                        <option value="M">Masculino (Azul)</option>
                                        <option value="F">Femenino (Rosa)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-danger fw-bold">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm p-3">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Colaborador</th>
                        <th>Email</th>
                        <th>Rol Asignado</th>
                        <th>Género</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-usuarios">
                    <tr><td colspan="6" class="text-center">Cargando personal...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    await cargarTablaUsuarios();

    document.getElementById('btn-nuevo-usuario').addEventListener('click', () => {
        document.getElementById('form-usuario').reset();
        document.getElementById('usuario-id').value = '';
        document.getElementById('password_usuario').required = true; 
        document.getElementById('password-helper').classList.add('d-none');
        document.getElementById('modal-usuario-titulo').innerText = 'Registrar Colaborador';
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalUsuario')).show();
    });

    document.getElementById('form-usuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('usuario-id').value;
        const passwordValue = document.getElementById('password_usuario').value;

        const data = {
            nombre_completo: document.getElementById('nombre_usuario').value,
            email: document.getElementById('email_usuario').value,
            rol: document.getElementById('rol_usuario').value,
            genero: document.getElementById('genero_usuario').value
        };

        if (passwordValue) {
            data.password = passwordValue;
        }

        try {
            if (id) {
                await api.put(`/usuarios/${id}`, data);
            } else {
                await api.post('/usuarios', data);
            }
            
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalUsuario')).hide();
            await cargarTablaUsuarios();
        } catch (err) {
            alert("Error al guardar usuario: " + err.message);
        }
    });
}

async function cargarTablaUsuarios() {
    try {
        const usuarios = await api.get('/usuarios'); 
        const tbody = document.getElementById('tabla-usuarios');
        
        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuarios registrados</td></tr>';
            return;
        }

        tbody.innerHTML = usuarios.map(u => {
            let badgeRol = '';
            if (u.rol === 'ADMIN') badgeRol = '<span class="badge bg-danger">Administrador</span>';
            else if (u.rol === 'CAJERO') badgeRol = '<span class="badge bg-success">Cajero</span>';
            else badgeRol = '<span class="badge bg-primary">Almacenero</span>';

            const esMujer = u.genero === 'F';

            return `
            <tr>
                <td class="fw-bold">
                    <i class="fas ${esMujer ? 'fa-female text-pink' : 'fa-user text-blue'} me-2"></i> 
                    ${u.nombre_completo}
                </td>
                <td>${u.email}</td>
                <td>${badgeRol}</td>
                <td>
                    <span class="badge bg-light text-dark border">
                        ${esMujer ? 'Femenino' : 'Masculino'}
                    </span>
                </td>
                <td>
                    <span class="badge ${u.activo ? 'bg-success' : 'bg-secondary'}">
                        ${u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-editar-usuario" 
                            data-id="${u.id}" data-nombre="${u.nombre_completo}" 
                            data-email="${u.email}" data-rol="${u.rol}" data-genero="${u.genero}">
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    <button class="btn btn-sm ${u.activo ? 'btn-outline-danger' : 'btn-outline-success'} btn-toggle-usuario" 
                            data-id="${u.id}" data-estado="${u.activo}">
                        <i class="fas ${u.activo ? 'fa-ban' : 'fa-check'}"></i>
                    </button>
                </td>
            </tr>
            `;
        }).join('');

        document.querySelectorAll('.btn-editar-usuario').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('usuario-id').value = btn.dataset.id;
                document.getElementById('nombre_usuario').value = btn.dataset.nombre;
                document.getElementById('email_usuario').value = btn.dataset.email;
                document.getElementById('rol_usuario').value = btn.dataset.rol;
                document.getElementById('genero_usuario').value = btn.dataset.genero;
                
                document.getElementById('password_usuario').required = false; 
                document.getElementById('password-helper').classList.remove('d-none');
                
                document.getElementById('modal-usuario-titulo').innerText = 'Editar Colaborador';
                bootstrap.Modal.getOrCreateInstance(document.getElementById('modalUsuario')).show();
            });
        });

        document.querySelectorAll('.btn-toggle-usuario').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const estadoActual = btn.dataset.estado === 'true';
                if (confirm(`¿Estás seguro de que deseas ${estadoActual ? 'desactivar' : 'activar'} a este usuario?`)) {
                    try {
                        await api.patch(`/usuarios/${id}/estado`, { activo: !estadoActual });
                        await cargarTablaUsuarios();
                    } catch (err) {
                        alert("Error al cambiar estado: " + err.message);
                    }
                }
            });
        });

    } catch (err) {
        document.getElementById('tabla-usuarios').innerHTML = `<tr><td colspan="6" class="text-danger text-center">Error al cargar usuarios</td></tr>`;
    }
}