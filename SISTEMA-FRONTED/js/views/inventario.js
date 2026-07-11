import { api } from '../api.js';

export async function renderInventario(container) {
    container.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <h3>Inventario de Productos</h3>
            <button class="btn btn-success" id="btn-nuevo">
                + Nuevo Producto
            </button>
        </div>
        
        <div class="modal fade" id="modalProducto" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="form-producto">
                        <input type="hidden" id="producto-id">
                        
                        <div class="modal-header"><h5 class="modal-title" id="modal-titulo">Agregar Producto</h5></div>
                        <div class="modal-body">
                            <input type="text" id="nombre" class="form-control mb-2" placeholder="Nombre" required>
                            <input type="number" id="precio" class="form-control mb-2" placeholder="Precio" step="0.01" required>
                            <input type="number" id="stock" class="form-control mb-2" placeholder="Stock Inicial" required>
                            <select id="categoria_id" class="form-select mb-2" required>
                                <option value="">Seleccione una categoría...</option>
                            </select>
                            <textarea id="descripcion" class="form-control mb-2" placeholder="Descripción"></textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Guardar Producto</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <table class="table table-hover shadow-sm">
            <thead class="table-dark">
                <tr><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
            </thead>
            <tbody id="tabla-productos"></tbody>
        </table>
    `;

    await Promise.all([cargarTabla(container), cargarCategorias()]);

    document.getElementById('btn-nuevo').addEventListener('click', () => {
        document.getElementById('form-producto').reset();
        document.getElementById('producto-id').value = '';
        document.getElementById('modal-titulo').innerText = 'Agregar Producto';
        
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto'));
        modal.show();
    });

    document.getElementById('form-producto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('producto-id').value;
        const data = {
            nombre: document.getElementById('nombre').value,
            precio: parseFloat(document.getElementById('precio').value),
            stock_actual: parseInt(document.getElementById('stock').value),
            categoria_id: parseInt(document.getElementById('categoria_id').value),
            descripcion: document.getElementById('descripcion').value
        };

        try {
            if (id) {
                await api.put(`/productos/${id}`, data); 
            } else {
                await api.post('/productos', data);
            }
            
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto'));
            modal.hide();
            
            e.target.reset();
            document.getElementById('producto-id').value = ''; 
            await cargarTabla(container);
        } catch (err) { 
            alert("Error: " + err.message); 
        }
    });
}

async function cargarCategorias() {
    try {
        const categorias = await api.get('/categorias');
        const select = document.getElementById('categoria_id');
        select.innerHTML = '<option value="">Seleccione una categoría...</option>' + 
            categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    } catch (err) {
        console.error("Error al cargar categorías", err);
    }
}

async function cargarTabla(container) {
    try {
        const productos = await api.get('/productos');
        const tbody = document.getElementById('tabla-productos');
        tbody.innerHTML = productos.map(p => `
            <tr>
                <td>${p.nombre}</td>
                <td>S/ ${parseFloat(p.precio).toFixed(2)}</td>
                <td>${p.stock_actual}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-editar" 
                            data-id="${p.id}" data-nombre="${p.nombre}" 
                            data-precio="${p.precio}" data-stock="${p.stock_actual}" 
                            data-cat="${p.categoria_id}" data-desc="${p.descripcion}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${p.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('producto-id').value = btn.dataset.id;
                document.getElementById('nombre').value = btn.dataset.nombre;
                document.getElementById('precio').value = btn.dataset.precio;
                document.getElementById('stock').value = btn.dataset.stock;
                document.getElementById('categoria_id').value = btn.dataset.cat;
                document.getElementById('descripcion').value = btn.dataset.desc;
                document.getElementById('modal-titulo').innerText = 'Editar Producto'; 
                
                const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto'));
                modal.show();
            });
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('¿Eliminar producto?')) {
                    await api.delete(`/productos/${btn.dataset.id}`);
                    await cargarTabla(container);
                }
            });
        });
    } catch (err) {
        document.getElementById('tabla-productos').innerHTML = `<tr><td colspan="4" class="text-danger text-center">Error al cargar datos</td></tr>`;
    }
}