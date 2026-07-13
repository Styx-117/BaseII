// js/views/ventas.js
import { api } from '../api.js';
import { getUser } from '../auth.js';

export async function renderVentas(container) {
    const user = getUser();

    if (user.rol === 'ALMACENERO') {
        container.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100 mt-5">
                <div class="alert alert-danger shadow-sm text-center p-4" style="max-width: 400px;">
                    <i class="fas fa-lock fs-1 text-danger mb-3"></i>
                    <h5 class="fw-bold">Acceso Restringido</h5>
                    <p class="mb-0">Tu rol de almacén no tiene permisos para ver ni gestionar ventas.</p>
                </div>
            </div>
        `;
        return;
    }

    const esAdmin = user.rol === 'ADMIN';
    const esCajero = user.rol === 'CAJERO';

    container.innerHTML = `
        <div class="d-flex justify-content-between mb-4 align-items-center">
            <div>
                <h3 class="mb-0"><i class="fas fa-file-invoice-dollar text-success me-2"></i> Historial de Ventas</h3>
                ${esCajero ? '<small class="text-muted"><i class="fas fa-clock me-1"></i> Mostrando ventas recientes (últimos 3 días)</small>' : ''}
            </div>
            
            ${esCajero ? `
                <a href="#nueva-venta" id="btn-ir-nueva-venta" class="btn btn-success fw-bold shadow-sm">
                    <i class="fas fa-cash-register"></i> Nueva Venta
                </a>
            ` : `
                <span class="badge bg-secondary fs-6"><i class="fas fa-user-shield"></i> Modo Auditoría Completa</span>
            `}
        </div>

        <div class="modal fade" id="modalDetalleVenta" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-light">
                        <h5 class="modal-title fw-bold">Detalle de Venta #<span id="detalle-id"></span></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="area-impresion">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <p class="mb-1 text-muted small">Cliente:</p>
                                <h6 id="detalle-cliente" class="fw-bold">---</h6>
                            </div>
                            <div class="col-md-6 text-md-end">
                                <p class="mb-1 text-muted small">Fecha y Vendedor:</p>
                                <h6 id="detalle-fecha-vendedor">---</h6>
                            </div>
                        </div>
                        <table class="table table-bordered table-sm mt-3">
                            <thead class="table-dark">
                                <tr>
                                    <th>Producto</th>
                                    <th class="text-center">Cant.</th>
                                    <th class="text-end">P. Unitario</th>
                                    <th class="text-end">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-detalle-productos"></tbody>
                            <tfoot>
                                <tr>
                                    <th colspan="3" class="text-end">TOTAL:</th>
                                    <th class="text-end fs-5 text-success" id="detalle-total">S/ 0.00</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-primary" id="btn-imprimir">
                            <i class="fas fa-print"></i> Imprimir Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm p-3">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Vendedor</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-ventas">
                    <tr><td colspan="7" class="text-center">Cargando historial de ventas...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    await cargarHistorialVentas(esAdmin);

    document.getElementById('btn-imprimir').addEventListener('click', () => {
        const contenido = document.getElementById('area-impresion').innerHTML;
        const ventanaOriginal = document.body.innerHTML;
        
        document.body.innerHTML = `
            <div style="padding: 20px; font-family: monospace; max-width: 350px; margin: auto;">
                <h3 class="text-center fw-bold">BODEGA DON PEPITO</h3>
                <hr>
                ${contenido}
                <hr>
                <p class="text-center small">¡Gracias por su compra!</p>
            </div>
        `;
        window.print(); 
        document.body.innerHTML = ventanaOriginal;
        window.location.reload(); 
    });

    if (esCajero) {
        document.getElementById('btn-ir-nueva-venta').addEventListener('click', (e) => {
            
        });
    }
}

async function cargarHistorialVentas(esAdmin) {
    try {
        const ventas = await api.get('/ventas'); 
        const tbody = document.getElementById('tabla-ventas');
        
        if (ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay ventas registradas en este periodo</td></tr>';
            return;
        }

        tbody.innerHTML = ventas.map(v => {
            const fechaBD = v.fecha || v.fecha_venta; 
            const fechaMostrada = fechaBD ? new Date(fechaBD).toLocaleString() : 'Sin fecha';
            const estado = v.estado || 'COMPLETADA';
            const badgeEstado = estado === 'ANULADA' 
                ? '<span class="badge bg-danger">Anulada</span>'
                : '<span class="badge bg-success">Completada</span>';

            return `
            <tr>
                <td class="fw-bold text-muted">#00${v.id}</td>
                <td>${fechaMostrada}</td>
                <td>${v.cliente_nombre || 'Cliente General'}</td>
                <td><span class="badge bg-info text-dark">${v.vendedor_nombre}</span></td>
                <td class="fw-bold">S/ ${parseFloat(v.total).toFixed(2)}</td>
                <td>${badgeEstado}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-ver-detalle" data-id="${v.id}">
                        <i class="fas fa-eye"></i> Detalle
                    </button>
                    ${esAdmin && estado !== 'ANULADA' ? `
                        <button class="btn btn-sm btn-outline-danger btn-anular-venta ms-1" data-id="${v.id}">
                            <i class="fas fa-times-circle"></i> Anular
                        </button>
                    ` : ''}
                </td>
            </tr>
            `;
        }).join('');

        document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
            btn.addEventListener('click', async () => {
                await abrirModalDetalle(btn.dataset.id);
            });
        });

        if (esAdmin) {
            document.querySelectorAll('.btn-anular-venta').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const idVenta = btn.dataset.id;
                    if (confirm('🚨 ¿Estás seguro de que deseas ANULAR esta venta?\n\nEl dinero se restará de los ingresos y los productos regresarán automáticamente al stock (Kardex).')) {
                        try {
                            await api.patch(`/ventas/${idVenta}/anular`);
                            await cargarHistorialVentas(esAdmin); 
                        } catch (err) {
                            alert("Error al anular: " + err.message);
                        }
                    }
                });
            });
        }
    } catch (err) {
        document.getElementById('tabla-ventas').innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error al cargar historial</td></tr>`;
    }
}

async function abrirModalDetalle(idVenta) {
    try {
        const detalle = await api.get(`/ventas/${idVenta}`);
        const fechaBD = detalle.fecha || detalle.fecha_venta;
        const fechaMostrada = fechaBD ? new Date(fechaBD).toLocaleString() : 'Sin fecha';

        document.getElementById('detalle-id').innerText = detalle.id;
        document.getElementById('detalle-cliente').innerText = detalle.cliente_nombre || 'Cliente General';
        document.getElementById('detalle-fecha-vendedor').innerText = `${fechaMostrada} | Por: ${detalle.vendedor_nombre}`;
        document.getElementById('detalle-total').innerText = `S/ ${parseFloat(detalle.total).toFixed(2)}`;

        const tbodyProductos = document.getElementById('tabla-detalle-productos');
        tbodyProductos.innerHTML = detalle.productos.map(p => `
            <tr>
                <td>${p.producto_nombre}</td>
                <td class="text-center">${p.cantidad}</td>
                <td class="text-end">S/ ${parseFloat(p.precio_unitario).toFixed(2)}</td>
                <td class="text-end fw-bold">S/ ${parseFloat(p.subtotal).toFixed(2)}</td>
            </tr>
        `).join('');

        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalleVenta')).show();
    } catch (err) {
        alert("Error al cargar el detalle de la venta: " + err.message);
    }
}