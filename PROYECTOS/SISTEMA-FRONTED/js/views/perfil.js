import { api } from '../api.js';
import { getUser } from '../auth.js';

export async function renderPerfil(container) {
    const user = getUser(); 

    container.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="card border-0 shadow-sm mt-4">
                    <div class="card-header bg-primary text-white text-center py-4">
                        <div class="mb-3">
                            <div class="bg-white text-primary d-inline-flex justify-content-center align-items-center rounded-circle shadow" style="width: 80px; height: 80px;">
                                <i class="fas fa-user-edit fs-1"></i>
                            </div>
                        </div>
                        <h4 class="mb-0 fw-bold">Mi Perfil</h4>
                        <small>${user.rol}</small>
                    </div>
                    <div class="card-body p-4">
                        <form id="form-perfil">
                            <div class="mb-3">
                                <label class="form-label text-muted small fw-bold">Nombre Completo</label>
                                <input type="text" id="perfil_nombre" class="form-control" value="${user.nombre_completo}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-muted small fw-bold">Correo Electrónico</label>
                                <input type="email" id="perfil_email" class="form-control" value="${user.email}" required>
                            </div>
                            
                            <hr class="my-4">
                            <h6 class="fw-bold text-dark mb-3"><i class="fas fa-lock text-muted me-2"></i>Seguridad</h6>
                            
                            <div class="mb-3">
                                <label class="form-label text-muted small fw-bold">Nueva Contraseña</label>
                                <input type="password" id="perfil_password" class="form-control" placeholder="Escribe solo si deseas cambiarla">
                                <small class="text-muted" style="font-size: 0.75rem;">Déjalo en blanco para mantener tu contraseña actual.</small>
                            </div>

                            <div class="d-grid mt-4">
                                <button type="submit" class="btn btn-primary fw-bold">
                                    <i class="fas fa-save me-2"></i> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('form-perfil').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            nombre_completo: document.getElementById('perfil_nombre').value,
            email: document.getElementById('perfil_email').value,
            rol: user.rol, 
            genero: user.genero 
        };

        const password = document.getElementById('perfil_password').value;
        if (password) {
            data.password = password;
        }

        try {
            await api.put(`/usuarios/${user.id}/perfil`, data);
            
            alert("¡Perfil actualizado con éxito! Por favor, inicia sesión nuevamente para reflejar los cambios.");
            localStorage.clear();
            window.location.reload();
        } catch (err) {
            alert("Error al actualizar el perfil: " + err.message);
        }
    });
}