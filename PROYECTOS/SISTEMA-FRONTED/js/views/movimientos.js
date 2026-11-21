import { api } from '../api.js';

export async function renderMovimientos(container) {
    container.innerHTML = `
        <div class="d-flex justify-content-between mb-4 align-items-center">
            <h3><i class="fas fa-exchange-alt text-info me-2"></i> Kardex de inventario</h3>
            <button class="btn btn-primary fw-bold" id="btn-nuevo-movimiento">
                <i class="fas fa-plus"></i> Movimiento Manual
            </button>
        </div>

        <div class="modal fade" id="modalMovimiento" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="form-movimiento">
                        <div class="modal-header bg-primary text-white">
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
                                        <option value="SALIDA">Egreso (Salida)</option>
                                        <option value="AJUSTE">Ajuste por merma (descuenta)</option>
                                    </select>
                                </div>
                                <div class="col-6">
                                    <label class="form-label small text-muted">Cantidad</label>
                                    <input type="number" id="mov_cantidad" class="form-control" min="1" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small text-muted">Motivo / Justificación</label>
                                <input type="text" maxlength="255" id="mov_motivo" class="form-control" placeholder="Ej: Compra a proveedor, Producto dañado..." required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary fw-bold">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm p-3">
            <div class="kardex-filtros">
                <label>Buscar movimiento<input id="k-buscar" type="search" class="form-control" placeholder="Producto, motivo o responsable"></label>
                <label>Tipo<select id="k-tipo" class="form-select"><option value="">Todos</option><option>INGRESO</option><option>SALIDA</option><option>AJUSTE</option></select></label>
            </div>
            <div class="table-responsive"><table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Saldo posterior</th><th>Motivo</th>
                        <th>Registrado por</th>
                    </tr>
                </thead>
                <tbody id="tabla-movimientos">
                    <tr><td colspan="7" class="text-center">Cargando movimientos...</td></tr>
                </tbody>
            </table></div>
        </div>
    `;

    let registros = [];
    const buscar = container.querySelector('#k-buscar');
    const tipo = container.querySelector('#k-tipo');
    const tabla = container.querySelector('#tabla-movimientos');
    function filtrar() {
        const texto = buscar.value.trim().toLocaleLowerCase();
        const visibles = registros.filter(m => (!tipo.value || m.tipo_movimiento === tipo.value)
            && [m.producto, m.motivo, m.responsable].join(' ').toLocaleLowerCase().includes(texto));
        tabla.replaceChildren();
        for (const m of visibles) {
            const fila = tabla.insertRow();
            const ingreso = m.tipo_movimiento === 'INGRESO';
            const valores = [new Date(m.fecha_movimiento).toLocaleString('es-PE'), m.producto,
                m.tipo_movimiento, (ingreso ? '+' : '−') + m.cantidad, m.saldo_despues ?? 'Sin registro', m.motivo, m.responsable];
            for (const valor of valores) fila.insertCell().textContent = valor;
            fila.cells[3].className = ingreso ? 'text-success fw-bold' : 'text-danger fw-bold';
        }
        if (!visibles.length) {
            const celda = tabla.insertRow().insertCell();
            celda.colSpan = 7;
            celda.textContent = registros.length ? 'Ningún movimiento coincide con los filtros.' : 'Todavía no hay movimientos.';
        }
    }
    async function cargarTablaMovimientos() {
        registros = await api.get('/kardex');
        filtrar();
    }
    buscar.oninput = tipo.onchange = filtrar;
    try { await cargarTablaMovimientos(); } catch (error) { tabla.rows[0].cells[0].textContent = error.message; }
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

        const boton = e.currentTarget.querySelector('[type=submit]');
        boton.disabled = true;
        try {
            await api.post('/kardex', data);
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalMovimiento')).hide();
            await Promise.all([cargarTablaMovimientos(), cargarSelectProductos()]);
        } catch (err) {
            alert(err.message);
        } finally { boton.disabled = false; }
    });
}

async function cargarSelectProductos() {
    try {
        const productos = await api.get('/productos');
        const select = document.getElementById('mov_producto_id');
        select.replaceChildren(new Option('Seleccione un producto…', ''), ...productos.map(p => new Option(p.nombre + ' · Stock: ' + p.stock_actual, p.id)));
    } catch (err) {
        console.error("Error cargando productos para el modal", err);
    }
}