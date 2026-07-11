//clientes.js
import { api } from '../api.js';
import { getUser } from '../auth.js'; 

export async function renderClientes(container) {
    const user = getUser();

    if (user.rol === 'ALMACENERO') {
        container.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100 mt-5">
                <div class="alert alert-danger shadow-sm text-center p-4" style="max-width: 400px;">
                    <i class="fas fa-lock fs-1 text-danger mb-3"></i>
                    <h5 class="fw-bold">Acceso Restringido</h5>
                    <p class="mb-0">Tu rol de almacén no tiene los permisos necesarios para acceder a la gestión comercial de clientes.</p>
                </div>
            </div>
        `;
        return; 
    }

    const esAdmin = user.rol === 'ADMIN';

    container.innerHTML = `
        <div class="d-flex justify-content-between mb-4 align-items-center">
            <h3><i class="fas fa-users text-warning me-2"></i> Gestión de Clientes</h3>
            <button class="btn btn-warning text-dark fw-bold" id="btn-nuevo-cliente">
                + Nuevo Cliente
            </button>
        </div>

        <div class="modal fade" id="modalCliente" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="form-cliente">
                        <input type="hidden" id="cliente-id">
                        
                        <div class="modal-header bg-warning text-dark">
                            <h5 class="modal-title fw-bold" id="modal-cliente-titulo">Agregar Cliente</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label small text-muted">Nombre / Razón Social</label>
                                <input type="text" id="nombre_cliente" class="form-control" placeholder="Ej: Juan Pérez o Empresa S.A.C." required>
                            </div>
                            <div class="row mb-3">
                                <div class="col-6">
                                    <label class="form-label small text-muted">Documento (DNI/RUC)</label>
                                    <input type="text" id="documento_cliente" class="form-control" required>
                                </div>
                                <div class="col-6">
                                    <label class="form-label small text-muted">Correo Electrónico</label>
                                    <input type="email" id="email_cliente" class="form-control">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small text-muted">Teléfonos (Separados por coma)</label>
                                <input type="text" id="telefonos_cliente" class="form-control" placeholder="Ej: 987654321, 912345678">
                                <small class="text-muted" style="font-size: 0.75rem;">Opcional. Puedes ingresar varios números.</small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-warning text-dark fw-bold">Guardar Cliente</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm p-3">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Nombre</th>
                        <th>Documento</th>
                        <th>Email</th>
                        <th>Teléfonos</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-clientes">
                    <tr><td colspan="6" class="text-center">Cargando clientes...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    await cargarTablaClientes(container, esAdmin);

    document.getElementById('btn-nuevo-cliente').addEventListener('click', () => {
        document.getElementById('form-cliente').reset();
        document.getElementById('cliente-id').value = '';
        document.getElementById('modal-cliente-titulo').innerText = 'Agregar Cliente';
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCliente')).show();
    });

    document.getElementById('form-cliente').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('cliente-id').value;
        
        const telefonosInput = document.getElementById('telefonos_cliente').value;
        const telefonosArray = telefonosInput 
            ? telefonosInput.split(',').map(t => t.trim()).filter(t => t.length > 0) 
            : [];

        const data = {
            nombre: document.getElementById('nombre_cliente').value,
            documento: document.getElementById('documento_cliente').value,
            email: document.getElementById('email_cliente').value,
            telefonos_secundarios: telefonosArray, 
            activo: true
        };

        try {
            if (id) {
                await api.put(`/clientes/${id}`, data);
            } else {
                await api.post('/clientes', data);
            }
            
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCliente')).hide();
            await cargarTablaClientes(container, esAdmin);
        } catch (err) {
            alert("Error al guardar: " + err.message);
        }
    });
}

async function cargarTablaClientes(container, esAdmin) {
    try {
        const clientesBD = await api.get('/clientes');
        const tbody = document.getElementById('tabla-clientes');
        
        const clientes = esAdmin ? clientesBD : clientesBD.filter(c => c.activo === true);
        
        if (clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay clientes para mostrar</td></tr>';
            return;
        }

        tbody.innerHTML = clientes.map(c => {
            const telefonosBadges = c.telefonos_secundarios && c.telefonos_secundarios.length > 0 
                ? c.telefonos_secundarios.map(t => `<span class="badge bg-light text-dark border">${t}</span>`).join(' ')
                : '<span class="text-muted small">Sin teléfono</span>';

            return `
            <tr>
                <td class="fw-bold">${c.nombre}</td>
                <td>${c.documento}</td>
                <td>${c.email || '-'}</td>
                <td>${telefonosBadges}</td>
                <td>
                    <span class="badge ${c.activo ? 'bg-success' : 'bg-secondary'}">
                        ${c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-editar-cliente" 
                            data-id="${c.id}" data-nombre="${c.nombre}" 
                            data-documento="${c.documento}" data-email="${c.email || ''}"
                            data-telefonos="${c.telefonos_secundarios ? c.telefonos_secundarios.join(', ') : ''}">
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    ${esAdmin ? `
                    <button class="btn btn-sm ${c.activo ? 'btn-outline-danger' : 'btn-outline-success'} btn-toggle-cliente" 
                            data-id="${c.id}" data-estado="${c.activo}">
                        <i class="fas ${c.activo ? 'fa-ban' : 'fa-check'}"></i>
                    </button>
                    ` : ''}
                </td>
            </tr>
            `;
        }).join('');

        document.querySelectorAll('.btn-editar-cliente').forEach(btn => {
            btn.addEventListener('click', () => {
                const inputNombre = document.getElementById('nombre_cliente');
                const inputDocumento = document.getElementById('documento_cliente');

                document.getElementById('cliente-id').value = btn.dataset.id;
                inputNombre.value = btn.dataset.nombre;
                inputDocumento.value = btn.dataset.documento;
                document.getElementById('email_cliente').value = btn.dataset.email;
                document.getElementById('telefonos_cliente').value = btn.dataset.telefonos;
                
                if (!esAdmin) {
                    inputNombre.readOnly = true;
                    inputDocumento.readOnly = true;
                    inputNombre.classList.add('bg-light');
                    inputDocumento.classList.add('bg-light');
                } else {
                    inputNombre.readOnly = false;
                    inputDocumento.readOnly = false;
                    inputNombre.classList.remove('bg-light');
                    inputDocumento.classList.remove('bg-light');
                }
                
                document.getElementById('modal-cliente-titulo').innerText = 'Editar Cliente';
                bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCliente')).show();
            });
        });

        if (esAdmin) {
            document.querySelectorAll('.btn-toggle-cliente').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    const estadoActual = btn.dataset.estado === 'true';
                    if (confirm(`¿Deseas ${estadoActual ? 'desactivar' : 'activar'} a este cliente?`)) {
                        await api.patch(`/clientes/${id}/estado`, { activo: !estadoActual });
                        await cargarTablaClientes(container, esAdmin); 
                    }
                });
            });
        }

    } catch (err) {
        document.getElementById('tabla-clientes').innerHTML = `<tr><td colspan="6" class="text-danger text-center">Error al cargar clientes</td></tr>`;
    }
}