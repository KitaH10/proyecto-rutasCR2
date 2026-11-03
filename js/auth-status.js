document.addEventListener('DOMContentLoaded', () => {
    // Buscar la barra de estado con la nueva clase simplificada en español
    let barraSesion = document.querySelector('.sesion-barra');
    const sesion = JSON.parse(localStorage.getItem('sesionActiva'));

    if (!barraSesion) {
        barraSesion = document.querySelector('header div:last-child');
    }

    if (sesion && barraSesion) {

        barraSesion.innerHTML = `
            <span class="sesion-nombre"> ${sesion.nombre}</span>
            <button type="button" id="btn-cerrar-sesion" class="btn-eliminar" style="width: auto; padding: 6px 12px;">Cerrar Sesión</button>
        `;

        document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
            if (confirm('está seguro de que desea cerrar la sesión?')) {
                localStorage.removeItem('sesionActiva');
                localStorage.removeItem('rutasFavoritas');

                alert('sesión cerrada correctamente. Redirigiendo a la página de inicio...');
                
                if (window.location.pathname.includes('/html/')) {
                    window.location.href = '../index.html';
                } else {
                    window.location.href = 'index.html';
                }
            }
        });
    }
});
