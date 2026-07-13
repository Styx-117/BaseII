// js/views/nueva_venta.js
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
                        <label class="form-label small text-muted">Seleccionar Cliente</label>
                        <select id="venta-cliente" class="form-select" required>
                            <option value="">Seleccione un cliente...</option>
                        </select>
                    </div>
                </div>

                <div class="card border-0 shadow-sm p-4">
                    <h5 class="fw-bold mb-3 text-dark"><i class="fas fa-box text-muted me-2"></i> Añadir al Carrito</h5>
                    <form id="form-add-carrito">
                        
                        <div class="mb-3">
                            <label class="form-label small text-muted fw-bold text-primary"><i class="fas fa-search"></i> Buscar Producto</label>
                            <input type="text" id="buscar-producto" class="form-control border-primary" placeholder="Digita el nombre para filtrar...">
                        </div>

                        <div class="mb-3">
                            <label class="form-label small text-muted">Producto Seleccionado</label>
                            <select id="venta-producto" class="form-select" required>
                                <option value="">Cargando catálogo...</option>
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
                                <tr><td colspan="5" class="text-center text-muted py-4">El carrito está vacío.</td></tr>
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

        <div class="modal fade" id="modalComprobanteVenta" data-bs-backdrop="static" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title fw-bold"><i class="fas fa-check-circle me-2"></i> ¡Venta Procesada Con Éxito!</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="area-impresion-comprobante">
                        <div class="text-center mb-3">
                            <h5 class="fw-bold mb-0">BODEGA DON PEPITO</h5>
                            <small class="text-muted">Ticket de Venta Electrónico</small>
                        </div>
                        <hr class="border-dashed">
                        <div class="row small mb-3">
                            <div class="col-7">
                                <b>Operación:</b> #<span id="comp-id">000</span><br>
                                <b>Cliente:</b> <span id="comp-cliente">---</span>
                            </div>
                            <div class="col-5 text-end text-muted">
                                <span id="comp-fecha">--/--/----</span>
                            </div>
                        </div>
                        <table class="table table-sm table-borderless small mt-2">
                            <thead>
                                <tr class="border-bottom">
                                    <th>Descrip.</th>
                                    <th class="text-center">Cant.</th>
                                    <th class="text-end">Total</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-comprobante-productos"></tbody>
                            <tfoot>
                                <tr class="border-top fw-bold fs-6">
                                    <td colspan="2" class="pt-2">TOTAL PAGADO:</td>
                                    <td class="text-end text-success pt-2" id="comp-total">S/ 0.00</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Nueva Venta (Cerrar)</button>
                        <button type="button" class="btn btn-success fw-bold" id="btn-imprimir-comprobante">
                            <i class="fas fa-print"></i> Imprimir Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Cargar datos iniciales
    await Promise.all([cargarClientesSelect(), cargarProductosSelect()]);

    // 1. Filtrar productos al escribir (oninput)
    document.getElementById('buscar-producto').oninput = (e) => {
        const valorBusqueda = e.target.value.toLowerCase();
        const selectProducto = document.getElementById('venta-producto');
        
        selectProducto.innerHTML = '<option value="">Seleccione un producto...</option>';
        
        const filtrados = productosDisponibles.filter(p => p.nombre.toLowerCase().includes(valorBusqueda));

        if (filtrados.length === 0) {
            selectProducto.innerHTML = '<option value="">No se encontraron coincidencias</option>';
            return;
        }

        filtrados.forEach(p => {
            if (p.stock_actual > 0) {
                selectProducto.innerHTML += `<option value="${p.id}">${p.nombre} (Dispo: ${p.stock_actual})</option>`;
            }
        });
    };

    // 2. Cambiar producto seleccionado (onchange)
    document.getElementById('venta-producto').onchange = (e) => {
        const prodId = parseInt(e.target.value);
        const producto = productosDisponibles.find(p => p.id === prodId);
        
        const inputPrecio = document.getElementById('venta-precio');
        const inputCantidad = document.getElementById('venta-cantidad');
        const labelStock = document.getElementById('stock-disponible-label');

        if (producto) {
            inputPrecio.value = parseFloat(producto.precio).toFixed(2);
            inputCantidad.max = producto.stock_actual;
            labelStock.innerHTML = `Stock disponible: <b class="${producto.stock_actual <= 5 ? 'text-danger' : 'text-success'}">${producto.stock_actual} unids.</b>`;
        } else {
            inputPrecio.value = '';
            inputCantidad.removeAttribute('max');
            labelStock.innerText = 'Stock disponible: -';
        }
    };

    // 3. Añadir producto al carrito (onsubmit)
    document.getElementById('form-add-carrito').onsubmit = (e) => {
        e.preventDefault();
        
        const selectProd = document.getElementById('venta-producto');
        const productoId = parseInt(selectProd.value);
        const cantidad = parseInt(document.getElementById('venta-cantidad').value);
        const producto = productosDisponibles.find(p => p.id === productoId);

        if (!producto) return;

        if (cantidad > producto.stock_actual) {
            alert(`Stock insuficiente en base de datos.`);
            return;
        }

        const existe = carrito.find(item => item.producto_id === productoId);
        if (existe) {
            if ((existe.cantidad + cantidad) > producto.stock_actual) {
                alert(`La cantidad acumulada supera el stock físico.`);
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
        document.getElementById('buscar-producto').value = ''; 
        document.getElementById('stock-disponible-label').innerText = 'Stock disponible: -';
        actualizarVistaCarrito();
    };

    // 4. Procesar y registrar la venta (onclick + Lock de seguridad)
    document.getElementById('btn-procesar-venta').onclick = async (e) => {
        e.preventDefault();

        const selectCliente = document.getElementById('venta-cliente');
        const clienteId = selectCliente.value;
        const btnProcesar = document.getElementById('btn-procesar-venta');

        // CONTROL CLAVE: Evita envíos duplicados si ya se está procesando uno
        if (btnProcesar.disabled && btnProcesar.innerHTML.includes('spinner')) return;

        if (!clienteId) {
            alert("Por favor, selecciona un cliente para la facturación.");
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
            // Deshabilitar botón inmediatamente y mostrar spinner
            btnProcesar.disabled = true;
            btnProcesar.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Registrando Venta...`;

            const res = await api.post('/ventas', payload);
            
            // Llenar el modal de comprobante electrónico con la respuesta
            document.getElementById('comp-id').innerText = res.venta_id || 'NUEVA';
            document.getElementById('comp-cliente').innerText = selectCliente.options[selectCliente.selectedIndex].text;
            document.getElementById('comp-fecha').innerText = new Date().toLocaleString();
            document.getElementById('comp-total').innerText = document.getElementById('total-carrito').innerText;

            const tbodyComp = document.getElementById('tabla-comprobante-productos');
            tbodyComp.innerHTML = carrito.map(item => `
                <tr>
                    <td>${item.nombre}</td>
                    <td class="text-center">x${item.cantidad}</td>
                    <td class="text-end">S/ ${item.total_item.toFixed(2)}</td>
                </tr>
            `).join('');

            // Abrir modal de éxito
            const modalComprobante = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalComprobanteVenta'));
            modalComprobante.show();

        } catch (err) {
            alert("Error al procesar la venta: " + err.message);
            
            // En caso de error de red o de stock, restaurar el botón para intentar de nuevo
            btnProcesar.disabled = false;
            btnProcesar.innerHTML = `<i class="fas fa-cash-register me-2"></i> Procesar y Generar Venta`;
        }
    };

    // 5. Al cerrar el modal de éxito, limpiar todo para la siguiente venta
    const modalEl = document.getElementById('modalComprobanteVenta');
    modalEl.addEventListener('hidden.bs.modal', async () => {
        carrito = [];
        actualizarVistaCarrito();
        document.getElementById('venta-cliente').value = '';
        document.getElementById('form-add-carrito').reset();
        document.getElementById('buscar-producto').value = '';
        document.getElementById('stock-disponible-label').innerText = 'Stock disponible: -';
        
        await cargarProductosSelect();
    });

    // 6. Imprimir el comprobante de venta (onclick)
    document.getElementById('btn-imprimir-comprobante').onclick = () => {
        const contenido = document.getElementById('area-impresion-comprobante').innerHTML;
        const ventanaOriginal = document.body.innerHTML;
        
        document.body.innerHTML = `
            <div style="padding: 20px; font-family: monospace; max-width: 350px; margin: auto;">
                <hr>
                ${contenido}
                <hr>
                <p class="text-center small">¡Gracias por su compra!</p>
            </div>
        `;
        window.print(); 
        
        document.body.innerHTML = ventanaOriginal;
        window.location.reload(); 
    };
}

function actualizarVistaCarrito() {
    const tbody = document.getElementById('tabla-carrito');
    const totalLabel = document.getElementById('total-carrito');
    const btnProcesar = document.getElementById('btn-procesar-venta');

    if (carrito.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">El carrito está vacío.</td></tr>';
        totalLabel.innerText = 'S/ 0.00';
        btnProcesar.disabled = true;
        btnProcesar.innerHTML = `<i class="fas fa-cash-register me-2"></i> Procesar y Generar Venta`;
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

    // Asignar el borrado de elementos (onclick individual)
    document.querySelectorAll('.btn-quitar-item').forEach(btn => {
        btn.onclick = (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            carrito.splice(index, 1);
            actualizarVistaCarrito();
        };
    });
}

async function cargarClientesSelect() {
    try {
        const clientes = await api.get('/clientes');
        const select = document.getElementById('venta-cliente');
        // Limpiamos opciones anteriores excepto la por defecto
        select.innerHTML = '<option value="">Seleccione un cliente...</option>';
        clientes.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.nombre} (${c.documento || 'Sin Doc'})</option>`;
        });
    } catch (err) {
        console.error("Error cargando clientes", err);
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
        console.error("Error cargando productos", err);
    }
}