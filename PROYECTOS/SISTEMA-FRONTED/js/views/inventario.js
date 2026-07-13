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
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <form id="form-producto" enctype="multipart/form-data">
                        <input type="hidden" id="producto-id">
                        
                        <div class="modal-header">
                            <h5 class="modal-title" id="modal-titulo">Agregar Producto</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <input type="text" id="nombre" class="form-control mb-2" placeholder="Nombre" required>
                                    <input type="number" id="precio" class="form-control mb-2" placeholder="Precio" step="0.01" required>
                                    <input type="number" id="stock" class="form-control mb-2" placeholder="Stock Inicial" required>
                                    <select id="categoria_id" class="form-select mb-2" required>
                                        <option value="">Seleccione una categoría...</option>
                                    </select>
                                    <textarea id="descripcion" class="form-control mb-2" placeholder="Descripción"></textarea>
                                </div>
                                <div class="col-md-4">
                                    <!-- NUEVO: Campo para imagen -->
                                    <div class="mb-3">
                                        <label for="imagen" class="form-label">Imagen del producto</label>
                                        <input type="file" class="form-control" id="imagen" accept="image/*">
                                        <small class="text-muted">Opcional, máximo 5MB (JPG, PNG, GIF)</small>
                                    </div>
                                    <!-- Vista previa (opcional) -->
                                    <div id="preview-container" class="text-center" style="display:none;">
                                        <img id="preview-imagen" src="#" alt="Vista previa" class="img-fluid rounded" style="max-height:150px;">
                                    </div>
                                </div>
                            </div>
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
                <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="tabla-productos"></tbody>
        </table>
    `;

    // Precarga de categorías y tabla
    await Promise.all([cargarTabla(container), cargarCategorias()]);

    // Evento para vista previa de imagen
    document.getElementById('imagen').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const previewContainer = document.getElementById('preview-container');
        const previewImg = document.getElementById('preview-imagen');
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                previewImg.src = event.target.result;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            previewContainer.style.display = 'none';
            previewImg.src = '#';
        }
    });

    // Botón Nuevo Producto
    document.getElementById('btn-nuevo').addEventListener('click', () => {
        document.getElementById('form-producto').reset();
        document.getElementById('producto-id').value = '';
        document.getElementById('modal-titulo').innerText = 'Agregar Producto';
        document.getElementById('preview-container').style.display = 'none';
        document.getElementById('preview-imagen').src = '#';
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto'));
        modal.show();
    });

    // Envío del formulario (con FormData)
    document.getElementById('form-producto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('producto-id').value;

        // Construir FormData
        const formData = new FormData();
        formData.append('nombre', document.getElementById('nombre').value);
        formData.append('precio', document.getElementById('precio').value);
        formData.append('stock_actual', document.getElementById('stock').value);
        formData.append('categoria_id', document.getElementById('categoria_id').value);
        formData.append('descripcion', document.getElementById('descripcion').value);

        // Agregar archivo de imagen (si se seleccionó)
        const fileInput = document.getElementById('imagen');
        if (fileInput.files.length > 0) {
            formData.append('imagen', fileInput.files[0]);
        }

        try {
            if (id) {
                // Editar: usar PUT con FormData
                await api.putForm(`/productos/${id}`, formData);
            } else {
                // Crear: usar POST con FormData
                await api.postForm('/productos', formData);
            }

            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto'));
            modal.hide();
            document.getElementById('form-producto').reset();
            document.getElementById('producto-id').value = '';
            document.getElementById('preview-container').style.display = 'none';
            await cargarTabla(container);
        } catch (err) {
            alert("Error: " + err.message);
        }
    });
}

// ---- Funciones auxiliares ----

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
                <td>
                    ${p.imagen_url ? `<img src="${p.imagen_url}" width="50" height="50" class="rounded" alt="Producto">` : 
                    `<span class="text-muted">Sin imagen</span>`}
                </td>
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

        // Eventos de edición
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('producto-id').value = btn.dataset.id;
                document.getElementById('nombre').value = btn.dataset.nombre;
                document.getElementById('precio').value = btn.dataset.precio;
                document.getElementById('stock').value = btn.dataset.stock;
                document.getElementById('categoria_id').value = btn.dataset.cat;
                document.getElementById('descripcion').value = btn.dataset.desc;
                document.getElementById('modal-titulo').innerText = 'Editar Producto';
                // Limpiar vista previa y campo de imagen (no podemos mostrar la imagen actual, se subirá nueva si se desea)
                document.getElementById('imagen').value = '';
                document.getElementById('preview-container').style.display = 'none';
                const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto'));
                modal.show();
            });
        });

        // Eventos de eliminación
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('¿Eliminar producto?')) {
                    await api.delete(`/productos/${btn.dataset.id}`);
                    await cargarTabla(container);
                }
            });
        });
    } catch (err) {
        document.getElementById('tabla-productos').innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error al cargar datos</td></tr>`;
    }
}