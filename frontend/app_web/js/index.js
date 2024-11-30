document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    const appContent = document.getElementById('appContent');

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    console.log('isLocal:', isLocal);

    function checkConnection() {
        if (isLocal) {
            loadData();
        } else if (navigator.onLine) {
            loadData();
        } else {
            loadingScreen.innerHTML = '<p>Error de conexión. Intenta de nuevo.</p><button onclick="checkConnection()">Reintentar</button>';
        }
    }

    function loadData() {
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            appContent.style.display = 'block';

            // Mostrar el nombre del usuario
            mostrarUsuario();

            // Validar permisos del usuario y ajustar las interfaces
            validateUserPermissions();
        }, isLocal ? 500 : 2000);
    }

    function mostrarUsuario() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token no encontrado. Redirigiendo al login...');
            window.location.href = '/login/index.html';
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userName = `${payload.Name || 'Usuario'} ${payload.LastName || ''}`;
            console.log('Nombre del usuario:', userName);

            const userElement = document.getElementById('usuario-loggeado');
            if (userElement) {
                userElement.textContent = `Bienvenido, ${userName}`;
            } else {
                console.error("No se encontró el elemento con ID 'usuario-loggeado'.");
            }
        } catch (err) {
            console.error('Error al decodificar el token:', err);
            window.alert('Error en autenticación. Por favor, inicia sesión nuevamente.');
            window.location.href = '/login/index.html';
        }
    }

    function validateUserPermissions() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token no encontrado. Redirigiendo al login...');
            window.location.href = '/login/index.html';
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userType = payload.UserType;

            // Ocultar interfaces específicas para empleados
            if (userType === 'Employee') {
                // Ocultar enlace a "Sitio Web"
                const sitioWebLink = document.querySelector('a[href*="sitio.html"]');
                if (sitioWebLink) {
                    sitioWebLink.style.display = 'none';
                }

            if (userType === 'Employee') {
                const registroMenu = document.getElementById('registro-menu');
                if (registroMenu) {
                        registroMenu.style.display = 'none'; // Ocultar el menú de registro
                }
            }
                // Ocultar enlaces "Nuevo" en todos los submenús
                const nuevoLinks = document.querySelectorAll('a[id^="nuevo-"]');
                nuevoLinks.forEach(link => link.style.display = 'none');

                // Ocultar botones "Agregar" en las interfaces de administrar
                const agregarBotones = document.querySelectorAll('.guardar, .btn-agregar');
                agregarBotones.forEach(button => button.style.display = 'none');

                // Ocultar última columna de acciones en tablas
                const actionColumns = document.querySelectorAll('table th:last-child, table td:last-child');
                actionColumns.forEach(column => column.style.display = 'none');

                
            }
        } catch (err) {
            console.error('Error al decodificar el token:', err);
            window.alert('Error en autenticación. Por favor, inicia sesión nuevamente.');
            window.location.href = '/login/index.html';
        }
    }

    checkConnection();
});
