import { api } from '../api.js';
import { getUser } from '../auth.js';

export async function renderAuditoria(container) {
    const user = getUser();

    if (user.rol !== 'ADMIN') {
        container.innerHTML = `<div class="alert alert-danger text-center mt-5">Acceso exclusivo para el Administrador del Sistema.</div>`;
        return;
    }

    container.innerHTML = `
        <div class="d-flex justify-content-between mb-4 align-items-center">
            <h3><i class="fas fa-history text-dark me-2"></i> Auditoría de Precios</h3>
            <span class="badge bg-dark p-2"><i class="fas fa-shield-alt me-1"></i> Control de Integridad</span>
        </div>

        <div class="card border-0 shadow-sm p-3">
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Fecha y Hora</th>
                            <th>Producto</th>
                            <th class="text-end">Precio Anterior</th>
                            <th class="text-end">Precio Nuevo</th>
                            <th class="text-center">Variación</th>
                            <th>Modificado por</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-auditoria">
                        <tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Leyendo logs del Trigger...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    await cargarTablaAuditoria();
}

async function cargarTablaAuditoria() {
    try {
        const logs = await api.get('/auditoria');
        const tbody = document.getElementById('tabla-auditoria');

        if (!logs || logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se registran cambios de precios en el historial.</td></tr>';
            return;
        }

        tbody.innerHTML = logs.map(log => {
            const producto = log.producto_nombre || log.producto || 'Producto Eliminado';
            const precioViejo = parseFloat(log.precio_anterior || log.precio_viejo || 0);
            const precioNuevo = parseFloat(log.precio_nuevo || log.precio_actual || 0);
            const responsable = log.usuario_nombre || log.responsable || 'Sistema';
            const fecha = new Date(log.fecha_cambio || log.fecha || log.creado_en).toLocaleString();

            const diferencia = precioNuevo - precioViejo;
            let indicadorVisual = '';

            if (diferencia > 0) {
                indicadorVisual = `<span class="text-danger small fw-bold"><i class="fas fa-arrow-up me-1"></i>+S/ ${diferencia.toFixed(2)}</span>`;
            } else if (diferencia < 0) {
                indicadorVisual = `<span class="text-success small fw-bold"><i class="fas fa-arrow-down me-1"></i>-S/ ${Math.abs(diferencia).toFixed(2)}</span>`;
            } else {
                indicadorVisual = `<span class="text-muted small">Sin cambios</span>`;
            }

            return `
                <tr>
                    <td class="text-muted small">${fecha}</td>
                    <td class="fw-bold text-dark">${producto}</td>
                    <td class="text-end text-muted">S/ ${precioViejo.toFixed(2)}</td>
                    <td class="text-end fw-bold text-primary">S/ ${precioNuevo.toFixed(2)}</td>
                    <td class="text-center">${indicadorVisual}</td>
                    <td>
                        <span class="badge bg-light text-dark border">
                            <i class="fas fa-user-shield me-1 text-muted"></i> ${responsable}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        document.getElementById('tabla-auditoria').innerHTML = `
            <tr>
                <td colspan="6" class="text-danger text-center">
                    <i class="fas fa-exclamation-triangle me-1"></i> Error al conectar con la tabla de auditoría: ${err.message}
                </td>
            </tr>`;
    }
}