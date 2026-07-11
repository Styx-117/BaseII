import { api } from '../api.js';

export async function renderMovimientos(container) {
    container.innerHTML = `
        <div class="d-flex justify-content-between mb-4 align-items-center">
            <h3><i class="fas fa-exchange-alt text-info me-2"></i> Ingresos y Egresos (Kardex)</h3>
            <button class="btn btn-info text-white fw-bold" id="btn-nuevo-movimiento">
                <i class="fas fa-plus"></i> Movimiento Manual
            </button>
        </div>

        <div class="modal fade" id="modalMovimiento" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="form-movimiento">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title fw-bold">Registrar Movimiento Manual</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label small text-muted">Producto</label>
                                <select id="mov_producto_id" class="form-select" required>
                                    <option value="">Cargando productos...</option>
                                </select>
                            </div>
                            <div class="row mb-3">
                                <div class="col-6">
                                    <label class="form-label small text-muted">Tipo de Movimiento</label>
                                    <select id="mov_tipo" class="form-select" required>
                                        <option value="INGRESO">Ingreso (Entrada)</option>
                                        <option value="SALIDA">Egreso (Salida/Merma)</option>
                                    </select>
                                </div>
                                <div class="col-6">
                                    <label class="form-label small text-muted">Cantidad</label>
                                    <input type="number" id="mov_cantidad" class="form-control" min="1" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small text-muted">Motivo / Justificación</label>
                                <input type="text" id="mov_motivo" class="form-control" placeholder="Ej: Compra a proveedor, Producto dañado..." required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-info text-white fw-bold">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm p-3">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Motivo</th>
                        <th>Registrado por</th>
                    </tr>
                </thead>
                <tbody id="tabla-movimientos">
                    <tr><td colspan="6" class="text-center">Cargando movimientos...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    await cargarTablaMovimientos();
    await cargarSelectProductos();

    document.getElementById('btn-nuevo-movimiento').addEventListener('click', () => {
        document.getElementById('form-movimiento').reset();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalMovimiento')).show();
    });

    document.getElementById('form-movimiento').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            producto_id: parseInt(document.getElementById('mov_producto_id').value),
            tipo_movimiento: document.getElementById('mov_tipo').value,
            cantidad: parseInt(document.getElementById('mov_cantidad').value),
            motivo: document.getElementById('mov_motivo').value
        };

        try {
            await api.post('/kardex', data);
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalMovimiento')).hide();
            await cargarTablaMovimientos();
        } catch (err) {
            alert("Error al registrar: " + err.message);
        }
    });
}

async function cargarTablaMovimientos() {
    try {
        const movimientos = await api.get('/kardex'); 
        const tbody = document.getElementById('tabla-movimientos');
        
        if (movimientos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay movimientos registrados</td></tr>';
            return;
        }

        tbody.innerHTML = movimientos.map(m => {
            const esIngreso = m.tipo_movimiento === 'INGRESO';
            const badgeClass = esIngreso ? 'bg-success' : 'bg-danger';
            const iconClass = esIngreso ? 'fa-arrow-down' : 'fa-arrow-up';
            
            return `
            <tr>
                <td>${new Date(m.fecha_movimiento).toLocaleString()}</td>
                <td class="fw-bold">${m.producto_nombre}</td>
                <td><span class="badge ${badgeClass}"><i class="fas ${iconClass} me-1"></i> ${m.tipo_movimiento}</span></td>
                <td class="fw-bold ${esIngreso ? 'text-success' : 'text-danger'}">
                    ${esIngreso ? '+' : '-'}${m.cantidad}
                </td>
                <td class="text-muted small">${m.motivo}</td>
                <td><span class="badge bg-light text-dark border">${m.usuario_nombre}</span></td>
            </tr>
            `;
        }).join('');

    } catch (err) {
        document.getElementById('tabla-movimientos').innerHTML = `<tr><td colspan="6" class="text-danger text-center">Error al cargar kardex</td></tr>`;
    }
}

async function cargarSelectProductos() {
    try {
        const productos = await api.get('/productos');
        const select = document.getElementById('mov_producto_id');
        select.innerHTML = '<option value="">Seleccione un producto...</option>' + 
            productos.map(p => `<option value="${p.id}">${p.nombre} (Stock: ${p.stock_actual})</option>`).join('');
    } catch (err) {
        console.error("Error cargando productos para el modal", err);
    }
}