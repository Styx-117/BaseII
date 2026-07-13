import { api } from '../api.js';

let carrito = [];
let productosDisponibles = [];

export async function renderNuevaVenta(container) {
    carrito = [];

    container.innerHTML = `
        <div class="d-flex justify-content-between mb-4 align-items-center">
            <h3><i class="fas fa-shopping-cart text-success me-2"></i> Registrar Nueva Venta</h3>
            <a href="#ventas" id="btn-regresar-ventas" class="btn btn-outline-secondary fw-bold">
                <i class="fas fa-arrow-left"></i> Volver al Historial
            </a>
        </div>

        <div class="row g-4">
            <div class="col-lg-5">
                <div class="card border-0 shadow-sm p-4 mb-4">
                    <h5 class="fw-bold mb-3 text-dark"><i class="fas fa-user-tag text-muted me-2"></i> Datos del Cliente</h5>
                    <div class="mb-3">
                        <label class="form-label small text-muted">Seleccionar Cliente (Fragmentación Vertical)</label>
                        <select id="venta-cliente" class="form-select" required>
                            <option value="">Seleccione un cliente...</option>
                            </select>
                    </div>
                </div>

                <div class="card border-0 shadow-sm p-4">
                    <h5 class="fw-bold mb-3 text-dark"><i class="fas fa-box text-muted me-2"></i> Añadir al Carrito</h5>
                    <form id="form-add-carrito">
                        <div class="mb-3">
                            <label class="form-label small text-muted">Producto</label>
                            <select id="venta-producto" class="form-select" required>
                                <option value="">Cargando productos...</option>
                            </select>
                        </div>
                        <div class="row g-3 mb-3">
                            <div class="col-6">
                                <label class="form-label small text-muted">Precio Unitario</label>
                                <div class="input-group">
                                    <span class="input-group-text">S/</span>
                                    <input type="text" id="venta-precio" class="form-control" readonly disabled>
                                </div>
                            </div>
                            <div class="col-6">
                                <label class="form-label small text-muted">Cantidad</label>
                                <input type="number" id="venta-cantidad" class="form-control" min="1" value="1" required>
                            </div>
                        </div>
                        <div class="mb-2 text-end">
                            <small class="text-muted d-block" id="stock-disponible-label">Stock disponible: -</small>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-success fw-bold">
                                <i class="fas fa-plus-circle me-1"></i> Agregar al Carrito
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="col-lg-7">
                <div class="card border-0 shadow-sm p-4 h-100 d-flex flex-column">
                    <h5 class="fw-bold mb-3 text-dark"><i class="fas fa-list-ol text-muted me-2"></i> Detalle de la Compra</h5>
                    
                    <div class="table-responsive flex-grow-1" style="min-height: 200px;">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Producto</th>
                                    <th class="text-end">Precio</th>
                                    <th class="text-center">Cant.</th>
                                    <th class="text-end">Total</th>
                                    <th class="text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-carrito">
                                <tr><td colspan="5" class="text-center text-muted py-4">El carrito está vacío. Añade productos para empezar.</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="border-top pt-3 mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h4 class="mb-0 fw-bold text-secondary">Total a Pagar:</h4>
                            <h3 class="mb-0 fw-bold text-success" id="total-carrito">S/ 0.00</h3>
                        </div>
                        <div class="d-grid">
                            <button id="btn-procesar-venta" class="btn btn-primary btn-lg fw-bold shadow-sm" disabled>
                                <i class="fas fa-cash-register me-2"></i> Procesar y Generar Venta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    await Promise.all([cargarClientesSelect(), cargarProductosSelect()]);

    document.getElementById('venta-producto').addEventListener('change', (e) => {
        const prodId = parseInt(e.target.value);
        const producto = productosDisponibles.find(p => p.id === prodId);
        
        const inputPrecio = document.getElementById('venta-precio');
        const inputCantidad = document.getElementById('venta-cantidad');
        const labelStock = document.getElementById('stock-disponible-label');

        if (producto) {
            inputPrecio.value = parseFloat(producto.precio).toFixed(2);
            inputCantidad.max = producto.stock_actual;
            labelStock.innerHTML = `Stock disponible: <b class="${producto.stock_actual <= 5 ? 'text-danger' : 'text-success'}">${producto.stock_actual} unidades</b>`;
        } else {
            inputPrecio.value = '';
            inputCantidad.removeAttribute('max');
            labelStock.innerText = 'Stock disponible: -';
        }
    });

    document.getElementById('form-add-carrito').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const selectProd = document.getElementById('venta-producto');
        const productoId = parseInt(selectProd.value);
        const cantidad = parseInt(document.getElementById('venta-cantidad').value);
        const producto = productosDisponibles.find(p => p.id === productoId);

        if (!producto) return;

        if (cantidad > producto.stock_actual) {
            alert(`No puedes añadir esa cantidad. Solo hay ${producto.stock_actual} unidades disponibles.`);
            return;
        }

        const existe = carrito.find(item => item.producto_id === productoId);
        if (existe) {
            if ((existe.cantidad + cantidad) > producto.stock_actual) {
                alert(`La suma total en el carrito supera el stock físico disponible.`);
                return;
            }
            existe.cantidad += cantidad;
            existe.total_item = existe.cantidad * existe.precio_unitario;
        } else {
            carrito.push({
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: parseFloat(producto.precio),
                cantidad: cantidad,
                total_item: cantidad * parseFloat(producto.precio)
            });
        }

        document.getElementById('form-add-carrito').reset();
        document.getElementById('stock-disponible-label').innerText = 'Stock disponible: -';
        actualizarVistaCarrito();
    });

    document.getElementById('btn-procesar-venta').addEventListener('click', async () => {
        const clienteId = document.getElementById('venta-cliente').value;
        if (!clienteId) {
            alert("Por favor, selecciona un cliente para la facturación.");
            return;
        }

        if (!confirm(`¿Confirmar cobro de la venta por un total de ${document.getElementById('total-carrito').innerText}?`)) {
            return;
        }

        const payload = {
            cliente_id: parseInt(clienteId),
            items: carrito.map(item => ({
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario
            }))
        };

        try {
            await api.post('/ventas', payload);
            alert("¡Venta registrada con éxito y stock actualizado!");
            
            window.location.hash = '#ventas';
        } catch (err) {
            alert("Error al procesar la venta: " + err.message);
        }
    });

    document.getElementById('btn-regresar-ventas').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#ventas';
    });
}

function actualizarVistaCarrito() {
    const tbody = document.getElementById('tabla-carrito');
    const totalLabel = document.getElementById('total-carrito');
    const btnProcesar = document.getElementById('btn-procesar-venta');

    if (carrito.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">El carrito está vacío. Añade productos para empezar.</td></tr>';
        totalLabel.innerText = 'S/ 0.00';
        btnProcesar.disabled = true;
        return;
    }

    let subtotalGeneral = 0;

    tbody.innerHTML = carrito.map((item, index) => {
        subtotalGeneral += item.total_item;
        return `
            <tr>
                <td class="fw-bold text-dark">${item.nombre}</td>
                <td class="text-end text-muted">S/ ${item.precio_unitario.toFixed(2)}</td>
                <td class="text-center fw-bold bg-light" style="width: 80px;">${item.cantidad}</td>
                <td class="text-end fw-bold text-primary">S/ ${item.total_item.toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-link text-danger btn-quitar-item" data-index="${index}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    totalLabel.innerText = `S/ ${subtotalGeneral.toFixed(2)}`;
    btnProcesar.disabled = false;

    
    document.querySelectorAll('.btn-quitar-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            carrito.splice(index, 1); 
            actualizarVistaCarrito();
        });
    });
}

async function cargarClientesSelect() {
    try {
        const clientes = await api.get('/clientes');
        const select = document.getElementById('venta-cliente');
        clientes.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.nombre} (${c.documento || 'Sin Doc'})</option>`;
        });
    } catch (err) {
        console.error("Error cargando clientes para venta", err);
    }
}

async function cargarProductosSelect() {
    try {
        productosDisponibles = await api.get('/productos');
        const select = document.getElementById('venta-producto');
        select.innerHTML = '<option value="">Seleccione un producto...</option>';
        
        productosDisponibles.forEach(p => {
            if (p.stock_actual > 0) {
                select.innerHTML += `<option value="${p.id}">${p.nombre} (Dispo: ${p.stock_actual})</option>`;
            }
        });
    } catch (err) {
        console.error("Error cargando productos para venta", err);
        document.getElementById('venta-producto').innerHTML = '<option value="">Error al cargar catálogo</option>';
    }
}