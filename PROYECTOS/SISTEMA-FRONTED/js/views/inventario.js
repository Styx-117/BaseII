import { api } from '../api.js';

export async function renderInventario(container) {
    container.innerHTML = `
        <div class="d-flex justify-content-between mb-4 align-items-center">
            <h3><i class="fas fa-boxes text-primary me-2"></i> Inventario de Productos</h3>
            <button class="btn btn-primary fw-bold shadow-sm" id="btn-nuevo">
                <i class="fas fa-plus"></i> Nuevo Producto
            </button>
        </div>

        <div class="card border-0 shadow-sm p-3 mb-4 bg-light">
            <div class="row g-3 align-items-center">
                <div class="col-md-auto">
                    <i class="fas fa-filter text-muted"></i> <span class="fw-bold text-muted small text-uppercase">Filtros (Fragmentación):</span>
                </div>
                <div class="col-md-4">
                    <select id="filtro-categoria" class="form-select border-0 shadow-sm">
                        <option value="">Todas las Categorías</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <select id="filtro-proveedor" class="form-select border-0 shadow-sm">
                        <option value="">Todos los Proveedores</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="modal fade" id="modalProducto" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <form id="form-producto" enctype="multipart/form-data">
                        <input type="hidden" id="producto-id">
                        
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold" id="modal-titulo">Agregar Producto</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <label class="form-label small text-muted">Nombre del Producto</label>
                                    <input type="text" id="nombre" class="form-control mb-3" placeholder="Ej: Gaseosa 3L" required>
                                    
                                    <div class="row mb-3">
                                        <div class="col-6">
                                            <label class="form-label small text-muted">Precio (S/)</label>
                                            <input type="number" id="precio" class="form-control" placeholder="0.00" step="0.01" required>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label small text-muted">Stock Inicial</label>
                                            <input type="number" id="stock" class="form-control" placeholder="0" required>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <div class="col-6">
                                            <label class="form-label small text-muted">Categoría</label>
                                            <select id="categoria_id" class="form-select" required>
                                                <option value="">Seleccione...</option>
                                            </select>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label small text-muted">Proveedor</label>
                                            <select id="proveedor_id" class="form-select" required>
                                                <option value="">Seleccione...</option>
                                            </select>
                                        </div>
                                    </div>

                                    <label class="form-label small text-muted">Descripción</label>
                                    <textarea id="descripcion" class="form-control mb-2" rows="2" placeholder="Detalles del producto..."></textarea>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3 p-3 border rounded bg-light text-center">
                                        <label for="imagen" class="form-label fw-bold">Imagen (Opcional)</label>
                                        <input type="file" class="form-control form-control-sm mb-2" id="imagen" accept="image/*">
                                        <small class="text-muted d-block mb-3" style="font-size: 0.75rem;">Máx 5MB (JPG, PNG)</small>
                                        
                                        <div id="preview-container" style="display:none;">
                                            <img id="preview-imagen" src="#" alt="Vista previa" class="img-fluid rounded shadow-sm" style="max-height:150px; object-fit: cover;">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary fw-bold">Guardar Producto</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm p-3">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Proveedor</th>
                        <th>Precio</th>
                        <th class="text-center">Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tabla-productos">
                    <tr><td colspan="7" class="text-center">Cargando inventario...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    await Promise.all([cargarListasDesplegables(), cargarTabla(container)]);

    document.getElementById('filtro-categoria').addEventListener('change', () => cargarTabla(container));
    document.getElementById('filtro-proveedor').addEventListener('change', () => cargarTabla(container));

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

    document.getElementById('btn-nuevo').addEventListener('click', () => {
        document.getElementById('form-producto').reset();
        document.getElementById('producto-id').value = '';
        document.getElementById('modal-titulo').innerText = 'Agregar Producto';
        document.getElementById('preview-container').style.display = 'none';
        document.getElementById('preview-imagen').src = '#';
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto')).show();
    });

    document.getElementById('form-producto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('producto-id').value;

        const formData = new FormData();
        formData.append('nombre', document.getElementById('nombre').value);
        formData.append('precio', document.getElementById('precio').value);
        formData.append('stock_actual', document.getElementById('stock').value);
        formData.append('categoria_id', document.getElementById('categoria_id').value);
        formData.append('id_proveedor', document.getElementById('proveedor_id').value); // <--- NUEVO CAMPO
        formData.append('descripcion', document.getElementById('descripcion').value);

        const fileInput = document.getElementById('imagen');
        if (fileInput.files.length > 0) {
            formData.append('imagen', fileInput.files[0]);
        }

        try {
            if (id) {
                await api.putForm(`/productos/${id}`, formData);
            } else {
                await api.postForm('/productos', formData);
            }

            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto')).hide();
            await cargarTabla(container);
        } catch (err) {
            alert("Error: " + err.message);
        }
    });
}


async function cargarListasDesplegables() {
    try {
        const [categorias, proveedores] = await Promise.all([
            api.get('/categorias'),
            api.get('/proveedores')
        ]);
        
        const selectCatForm = document.getElementById('categoria_id');
        const selectCatFiltro = document.getElementById('filtro-categoria');
        
        const selectProvForm = document.getElementById('proveedor_id');
        const selectProvFiltro = document.getElementById('filtro-proveedor');

        // Llenar Categorías
        const htmlCategorias = categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        selectCatForm.innerHTML += htmlCategorias;
        selectCatFiltro.innerHTML += htmlCategorias;

        const htmlProveedores = proveedores.map(p => `<option value="${p.id_proveedor}">${p.nombre_comercial || p.razon_social}</option>`).join('');
        selectProvForm.innerHTML += htmlProveedores;
        selectProvFiltro.innerHTML += htmlProveedores;

    } catch (err) {
        console.error("Error al cargar listas desplegables", err);
    }
}

async function cargarTabla(container) {
    try {
        const tbody = document.getElementById('tabla-productos');
        tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';

        const catId = document.getElementById('filtro-categoria').value;
        const provId = document.getElementById('filtro-proveedor').value;

        let endpoint = '/productos?';
        if (catId) endpoint += `categoria_id=${catId}&`;
        if (provId) endpoint += `proveedor_id=${provId}`;

        const productos = await api.get(endpoint);
        
        if (productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No se encontraron productos</td></tr>';
            return;
        }

        tbody.innerHTML = productos.map(p => `
            <tr>
                <td>
                    ${p.imagen_url ? `<img src="${p.imagen_url}" width="45" height="45" class="rounded shadow-sm" style="object-fit: cover;" alt="Producto">` : 
                    `<div class="bg-light rounded d-flex justify-content-center align-items-center" style="width:45px; height:45px;"><i class="fas fa-box text-muted"></i></div>`}
                </td>
                <td class="fw-bold">${p.nombre}</td>
                <td><span class="badge bg-secondary">${p.categoria_nombre || 'General'}</span></td>
                <td><span class="badge bg-light text-dark border">${p.proveedor_nombre || '-'}</span></td>
                <td class="fw-bold text-success">S/ ${parseFloat(p.precio).toFixed(2)}</td>
                <td class="text-center">
                    <span class="badge ${p.stock_actual <= 5 ? 'bg-danger' : 'bg-success'} fs-6">${p.stock_actual}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-editar" 
                            data-id="${p.id}" data-nombre="${p.nombre}" 
                            data-precio="${p.precio}" data-stock="${p.stock_actual}" 
                            data-cat="${p.categoria_id}" data-prov="${p.id_proveedor || ''}"
                            data-desc="${p.descripcion || ''}" data-img="${p.imagen_url || ''}">
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
                document.getElementById('proveedor_id').value = btn.dataset.prov; // <--- Cargar proveedor al editar
                document.getElementById('descripcion').value = btn.dataset.desc;
                
                document.getElementById('modal-titulo').innerText = 'Editar Producto';
                
                const imgActual = btn.dataset.img;
                document.getElementById('imagen').value = ''; 
                if (imgActual) {
                    document.getElementById('preview-imagen').src = imgActual;
                    document.getElementById('preview-container').style.display = 'block';
                } else {
                    document.getElementById('preview-container').style.display = 'none';
                }

                bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto')).show();
            });
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('¿Estás seguro de eliminar este producto?')) {
                    try {
                        await api.delete(`/productos/${btn.dataset.id}`);
                        await cargarTabla(container);
                    } catch (err) {
                        alert("Error al eliminar: " + err.message);
                    }
                }
            });
        });
    } catch (err) {
        document.getElementById('tabla-productos').innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error al cargar datos</td></tr>`;
    }
}