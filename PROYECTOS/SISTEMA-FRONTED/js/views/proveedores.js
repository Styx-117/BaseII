import { api } from '../api.js';
import { getUser } from '../auth.js';

export async function renderProveedores(container) {
    const user = getUser();
    const esLogistica = user.rol === 'ADMIN' || user.rol === 'ALMACENERO';

    if (!esLogistica) {
        container.innerHTML = `<div class="alert alert-danger text-center mt-5">Acceso Restringido</div>`;
        return;
    }

    container.innerHTML = `
        <div class="d-flex justify-content-between mb-4 align-items-center">
            <h3><i class="fas fa-truck text-secondary me-2"></i> Gestión de Proveedores</h3>
            <button class="btn btn-secondary fw-bold shadow-sm" id="btn-nuevo-proveedor">
                <i class="fas fa-plus"></i> Nuevo Proveedor
            </button>
        </div>

        <div class="modal fade" id="modalProveedor" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="form-proveedor">
                        <input type="hidden" id="proveedor-id">
                        <div class="modal-header bg-secondary text-white">
                            <h5 class="modal-title fw-bold" id="modal-proveedor-titulo">Registrar Proveedor</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-5">
                                    <label class="form-label small text-muted">RUC</label>
                                    <input type="text" id="ruc_prov" class="form-control" required maxlength="11">
                                </div>
                                <div class="col-7">
                                    <label class="form-label small text-muted">Razón Social</label>
                                    <input type="text" id="razon_prov" class="form-control" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small text-muted">Nombre Comercial</label>
                                <input type="text" id="comercial_prov" class="form-control" placeholder="Ej: Distribuidora del Sur">
                            </div>
                            <div class="row mb-3">
                                <div class="col-6">
                                    <label class="form-label small text-muted">Teléfono</label>
                                    <input type="text" id="telefono_prov" class="form-control">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small text-muted">Correo</label>
                                    <input type="email" id="correo_prov" class="form-control">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small text-muted">Dirección y Ciudad</label>
                                <div class="input-group">
                                    <input type="text" id="direccion_prov" class="form-control" placeholder="Dirección">
                                    <input type="text" id="ciudad_prov" class="form-control" placeholder="Ciudad">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-secondary fw-bold">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm p-3">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>RUC</th>
                        <th>Proveedor</th>
                        <th>Contacto</th>
                        <th>Ciudad</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-proveedores">
                    <tr><td colspan="6" class="text-center">Cargando proveedores...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    await cargarTablaProveedores();

    document.getElementById('btn-nuevo-proveedor').addEventListener('click', () => {
        document.getElementById('form-proveedor').reset();
        document.getElementById('proveedor-id').value = '';
        document.getElementById('modal-proveedor-titulo').innerText = 'Registrar Proveedor';
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProveedor')).show();
    });

    document.getElementById('form-proveedor').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('proveedor-id').value;
        const data = {
            ruc: document.getElementById('ruc_prov').value,
            razon_social: document.getElementById('razon_prov').value,
            nombre_comercial: document.getElementById('comercial_prov').value,
            telefono: document.getElementById('telefono_prov').value,
            correo: document.getElementById('correo_prov').value,
            direccion: document.getElementById('direccion_prov').value,
            ciudad: document.getElementById('ciudad_prov').value
        };

        try {
            if (id) {
                await api.put(`/proveedores/${id}`, data);
            } else {
                await api.post('/proveedores', data);
            }
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProveedor')).hide();
            await cargarTablaProveedores();
        } catch (err) {
            alert("Error al guardar: " + err.message);
        }
    });
}

async function cargarTablaProveedores() {
    try {
        const proveedores = await api.get('/proveedores');
        const tbody = document.getElementById('tabla-proveedores');
        
        if (proveedores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay proveedores registrados</td></tr>';
            return;
        }

        tbody.innerHTML = proveedores.map(p => `
            <tr>
                <td class="fw-bold text-muted">${p.ruc}</td>
                <td>
                    <div class="fw-bold">${p.nombre_comercial || p.razon_social}</div>
                    <small class="text-muted">${p.razon_social}</small>
                </td>
                <td>
                    <div class="small"><i class="fas fa-phone me-1"></i> ${p.telefono || '-'}</div>
                    <div class="small"><i class="fas fa-envelope me-1"></i> ${p.correo || '-'}</div>
                </td>
                <td>${p.ciudad || '-'}</td>
                <td>
                    <span class="badge ${p.estado ? 'bg-success' : 'bg-secondary'}">
                        ${p.estado ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-editar-prov" 
                            data-id="${p.id_proveedor}" data-ruc="${p.ruc}" 
                            data-razon="${p.razon_social}" data-comercial="${p.nombre_comercial || ''}"
                            data-tel="${p.telefono || ''}" data-correo="${p.correo || ''}"
                            data-dir="${p.direccion || ''}" data-ciudad="${p.ciudad || ''}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm ${p.estado ? 'btn-outline-danger' : 'btn-outline-success'} btn-toggle-prov" 
                            data-id="${p.id_proveedor}" data-estado="${p.estado}">
                        <i class="fas ${p.estado ? 'fa-ban' : 'fa-check'}"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.btn-editar-prov').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('proveedor-id').value = btn.dataset.id;
                document.getElementById('ruc_prov').value = btn.dataset.ruc;
                document.getElementById('razon_prov').value = btn.dataset.razon;
                document.getElementById('comercial_prov').value = btn.dataset.comercial;
                document.getElementById('telefono_prov').value = btn.dataset.tel;
                document.getElementById('correo_prov').value = btn.dataset.correo;
                document.getElementById('direccion_prov').value = btn.dataset.dir;
                document.getElementById('ciudad_prov').value = btn.dataset.ciudad;
                
                document.getElementById('modal-proveedor-titulo').innerText = 'Editar Proveedor';
                bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProveedor')).show();
            });
        });

        document.querySelectorAll('.btn-toggle-prov').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const estadoActual = btn.dataset.estado === 'true';
                if (confirm(`¿Deseas ${estadoActual ? 'desactivar' : 'activar'} a este proveedor?`)) {
                    await api.patch(`/proveedores/${id}/estado`, { estado: !estadoActual });
                    await cargarTablaProveedores();
                }
            });
        });

    } catch (err) {
        document.getElementById('tabla-proveedores').innerHTML = `<tr><td colspan="6" class="text-danger text-center">Error al cargar proveedores</td></tr>`;
    }
}