import { api } from '../api.js';

const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const enlaces = {
    ADMIN: ['#usuarios', 'Gestionar empleados'],
    CAJERO: ['#nueva-venta', 'Registrar venta'],
    ALMACENERO: ['#movimientos', 'Abrir Kardex']
};

export function renderResumen(container, rol) {
    const [destino, accion] = enlaces[rol];
    const comercial = rol !== 'ALMACENERO';
    container.innerHTML = `
        <section class="resumen">
            <header class="panel-cabecera">
                <div><small>ICA Market · ${new Date().toLocaleDateString('es-PE', {day:'numeric',month:'long'})}</small>
                <h1>${comercial ? 'Resumen de ventas' : 'Resumen de inventario'}</h1></div>
                <a href="${destino}" class="btn btn-light">${accion} →</a>
            </header>
            ${comercial ? '<label class="periodo">Periodo <select class="form-select"><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option></select></label>' : ''}
            <div class="indicadores"></div>
            ${comercial ? '<section class="card p-4 mb-3"><h2>Ventas por día</h2><div class="serie"></div></section>' : ''}
            <section class="card p-4"><h2>Reposición prioritaria</h2><p>Los 10 productos con menos existencias, hasta 5 unidades.</p><ul class="reposicion"></ul></section>
            <div role="status"></div>
        </section>`;
    const panel = container.firstElementChild;
    const selector = panel.querySelector('select');
    async function cargar() {
        if (selector) selector.disabled = true;
        const estado = panel.querySelector('[role=status]');
        estado.textContent = 'Cargando resumen…';
        try {
            const data = await api.get('/dashboard/stats?dias=' + (selector?.value || 7));
            const ingresos = data.grafica.reduce((sum, d) => sum + d.total_dia, 0);
            const ventas = data.grafica.reduce((sum, d) => sum + d.ventas, 0);
            const indicadores = comercial
                ? [[rol === 'CAJERO' ? 'Mis ingresos' : 'Ingresos', soles.format(ingresos)], ['Ventas', ventas], ['Productos críticos', data.criticos]]
                : [['Productos activos', data.productos], ['Unidades disponibles', data.unidades], ['Productos críticos', data.criticos]];
            panel.querySelector('.indicadores').innerHTML = indicadores.map(([nombre, valor]) =>
                `<article><span>${nombre}</span><strong>${valor}</strong></article>`).join('');
            if (comercial) {
                const max = Math.max(1, ...data.grafica.map(d => d.total_dia));
                panel.querySelector('.serie').innerHTML = data.grafica.map(d =>
                    `<div class="dia"><small>${d.fecha}</small><span><i style="width:${100*d.total_dia/max}%"></i></span><b>${soles.format(d.total_dia)}</b></div>`).join('');
            }
            const lista = panel.querySelector('.reposicion');
            lista.replaceChildren(...data.alertas.map(p => {
                const item = document.createElement('li');
                item.textContent = p.nombre;
                const stock = document.createElement('strong');
                stock.textContent = p.stock_actual === 0 ? 'Agotado' : p.stock_actual + ' unidades';
                item.append(stock);
                return item;
            }));
            if (!lista.children.length) lista.textContent = 'Sin productos pendientes de reposición.';
            estado.textContent = '';
        } catch (error) {
            estado.textContent = 'No se pudo cargar el resumen. ' + error.message;
        } finally {
            if (selector) selector.disabled = false;
        }
    }
    selector?.addEventListener('change', cargar);
    cargar();
}
