export function renderConfiguracion(container) {
    
    const temaActual = localStorage.getItem('tema_sistema') || 'claro';

    container.innerHTML = `
        <div class="d-flex justify-content-between mb-4 align-items-center">
            <h3><i class="fas fa-cog text-secondary me-2"></i> Configuración del Sistema</h3>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card border-0 shadow-sm p-4 mb-4">
                    <h5 class="fw-bold mb-3 border-bottom pb-2">Apariencia</h5>
                    
                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input fs-5" type="checkbox" id="switch-tema" ${temaActual === 'oscuro' ? 'checked' : ''}>
                        <label class="form-check-label pt-1 ms-2 fw-bold text-muted" for="switch-tema">
                            <i class="fas fa-moon text-dark me-1"></i> Activar Modo Oscuro
                        </label>
                    </div>
                    <small class="text-muted d-block">Cambia la paleta de colores del panel a tonos oscuros para proteger la vista.</small>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card border-0 shadow-sm p-4">
                    <h5 class="fw-bold mb-3 border-bottom pb-2">Información del Sistema</h5>
                    <ul class="list-group list-group-flush text-muted small">
                        <li class="list-group-item bg-transparent px-0"><b>Versión:</b> 1.0.0 (Producción)</li>
                        <li class="list-group-item bg-transparent px-0"><b>Base de Datos:</b> PostgreSQL</li>
                        <li class="list-group-item bg-transparent px-0"><b>Servidor:</b> Node.js / Express</li>
                        <li class="list-group-item bg-transparent px-0"><b>Desarrollado por:</b> Equipo BD</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    document.getElementById('switch-tema').addEventListener('change', (e) => {
        const activado = e.target.checked;
        if (activado) {
            localStorage.setItem('tema_sistema', 'oscuro');
            document.body.style.backgroundColor = '#212529'; 
            alert("Preferencia guardada. Recarga la página para aplicar el modo oscuro.");
        } else {
            localStorage.setItem('tema_sistema', 'claro');
            document.body.style.backgroundColor = ''; 
        }
    });
}