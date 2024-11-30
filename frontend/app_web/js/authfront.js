document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('No tienes acceso. Por favor, inicia sesión.');
        redirectToLogin();
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        // Verificar si el token ha expirado
        if (payload.exp < currentTime) {
            localStorage.removeItem('token');
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            redirectToLogin();
            return;
        }

        // Manejo de permisos según el tipo de usuario
        const restrictedFoldersForEmployees = [
            '/html/agregar_datos/',
            '/html/modificar_datos/modificar_cliente.html',     
            '/html/modificar_datos/modificar_empleado.html',     
            '/html/modificar_datos/modificar_asignacion.html',     
            '/html/modificar_datos/modificar_proyecto.html',     
        ];

        const isRestrictedPage = restrictedFoldersForEmployees.some((folder) =>
            window.location.pathname.includes(folder)
        );

        if (payload.UserType !== 'Admin' && isRestrictedPage) {
            alert('No tienes permiso para acceder a esta página.');
            window.location.href = '/frontend/app_web/home.html'; // Redirige al Home
            return;
        }
    } catch (error) {
        console.error('Error al procesar el token:', error);
        localStorage.removeItem('token');
        alert('Error en la autenticación. Por favor, inicia sesión nuevamente.');
        redirectToLogin();
    }

    // Evento del botón "Cerrar Sesión"
    const logoutOption = document.getElementById('logout-option');
    if (logoutOption) {
        logoutOption.addEventListener('click', confirmarCierreSesion);
    }
});

// Función para confirmar cierre de sesión
function confirmarCierreSesion() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Quieres cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
    }).then((result) => {
        if (result.isConfirmed) {
            cerrarSesion(); // Llamar a la función de cerrar sesión si el usuario confirma
        }
    });
}

// Función para cerrar sesión con SweetAlert
async function cerrarSesion() {
    try {
        const response = await fetch('http://localhost:3000/api/logout', {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            localStorage.removeItem('token');
            Swal.fire({
                title: 'Sesión cerrada',
                text: 'Has cerrado sesión exitosamente.',
                icon: 'success',
                confirmButtonText: 'OK',
            }).then(() => {
                redirectToLogin();
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cerrar sesión. Intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    } catch (error) {
        Swal.fire({
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor. Intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'OK',
        });
    }
}

// Función para redirigir al login
function redirectToLogin() {
    window.location.href = '/frontend/login/index.html';
}
