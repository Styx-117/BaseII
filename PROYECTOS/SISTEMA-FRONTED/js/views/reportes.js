import { api } from '../api.js';

export async function renderReportes(container) {
    container.innerHTML = `<section class="reportes card p-4"><h2>Reportes e historial</h2>
        <form class="filtros-informe">
            <label>Reporte<select name="tipo" class="form-select"><option value="ventas">Detalle de ventas</option><option value="ingresos">Ingresos por medio de pago</option><option value="movimientos">Movimientos de stock</option><option value="operaciones">Auditoría de operaciones</option></select></label>
            <label>Desde<input class="form-control" type="date" name="desde" required></label>
            <label>Hasta<input class="form-control" type="date" name="hasta" required></label>
            <label>Producto<select class="form-select" name="producto"><option value="">Todos</option></select></label>
            <button class="btn btn-primary">Consultar</button>
            <button type="button" class="btn btn-outline-secondary exportar" disabled>Exportar CSV</button>
        </form><p role="status"></p><div class="table-responsive"><table class="table"><thead></thead><tbody></tbody></table></div></section>`;
    const panel = container.firstElementChild;
    const form = panel.querySelector('form');
    const {tipo,desde,hasta,producto} = form.elements;
    const estado = panel.querySelector('[role=status]');
    const exportar = panel.querySelector('.exportar');
    const fecha = new Date().toLocaleDateString('sv-SE',{timeZone:'America/Lima'});
    desde.value = fecha.slice(0,8)+'01';
    hasta.value = fecha;
    let resultado, version = 0;
    async function consultar() {
        const actual = ++version;
        exportar.disabled = true;
        estado.textContent = 'Consultando…';
        const cuerpo = panel.querySelector('tbody');
        const cabecera = panel.querySelector('thead');
        cuerpo.replaceChildren();
        cabecera.replaceChildren();
        try {
            const datos = await api.get('/reportes/'+tipo.value+'?'+new URLSearchParams(new FormData(form)));
            if (actual !== version) return;
            resultado = datos;
            const fila = cabecera.insertRow();
            for (const nombre of datos.columnas) {
                const th = document.createElement('th');
                th.textContent = nombre.replaceAll('_',' ');
                fila.append(th);
            }
            for (const registro of datos.filas) {
                const row = cuerpo.insertRow();
                for (const nombre of datos.columnas) {
                    const valor = registro[nombre];
                    const cell = row.insertCell();
                    if (nombre === 'fecha' && valor) {
                        cell.textContent = tipo.value === 'ingresos' ? valor.slice(0,10) :
                            new Date(valor).toLocaleString('es-PE', {timeZone:'America/Lima'});
                    } else if (['subtotal','ingresos','precio_unitario'].includes(nombre)) {
                        cell.textContent = Number(valor).toLocaleString('es-PE',{style:'currency',currency:'PEN'});
                    } else cell.textContent = valor ?? '—';
                }
            }
            estado.textContent = datos.filas.length + ' registros en el periodo';
            exportar.disabled = !datos.filas.length;
        } catch(error) { if (actual === version) estado.textContent = error.message; }
    }
    form.onchange = () => { producto.disabled = tipo.value === 'operaciones'; consultar(); };
    form.onsubmit = e => {e.preventDefault(); consultar();};
    exportar.onclick = () => {
        const campo = valor => {
            const texto = String(valor ?? '');
            return '"' + (/^[=+@\-\t\r]/.test(texto) ? "'" : '') + texto.replaceAll('"','""') + '"';
        };
        const filas = [resultado.columnas,...resultado.filas.map(r => resultado.columnas.map(k => r[k]))];
        const url = URL.createObjectURL(new Blob(['\uFEFF'+filas.map(f => f.map(campo).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
        const link = document.createElement('a');
        link.href = url; link.download = tipo.value+'-'+hasta.value+'.csv'; link.click();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
    try {
        for (const p of await api.get('/productos')) producto.add(new Option(p.nombre,p.id));
        consultar();
    } catch(error) { estado.textContent = error.message; }
}
