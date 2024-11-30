import { apiURL_credentials } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    // Validar el token antes de continuar
    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'No se encontró un token válido. Por favor, inicia sesión nuevamente.',
        }).then(() => {
            window.location.href = '../../../login/index.html';
        });
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar el token para obtener los datos
        if (payload.UserType === 'Employee') { // Verificar si el usuario es empleado
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permiso para acceder a esta página.',
            }).then(() => {
                localStorage.removeItem('token'); // Eliminar el token del almacenamiento local
                window.location.href = '/frontend/app_web/home.html';
            });
            return;
        }
    } catch (e) {
        console.error('Error al procesar el token:', e);
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'El token no es válido. Por favor, inicia sesión nuevamente.',
        }).then(() => {
            localStorage.removeItem('token'); // Eliminar el token si es inválido
            window.location.href = '../login/index.html';
        });
        return;
    }

    document.getElementById('id-user').addEventListener('input', verificarCampos);
    document.getElementById('email').addEventListener('input', verificarCampos);
    document.getElementById('password').addEventListener('input', verificarCampos);
    document.getElementById('confirm-password').addEventListener('input', verificarCampos);
    document.getElementById('guardar-credenciales-btn').addEventListener('click', (e) => {
        e.preventDefault();
        guardarCredenciales();
    });

    verificarCampos();
});

// Verificar si el token ha expirado
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (e) {
        console.error('Error al decodificar el token:', e);
        return true;
    }
}

// Función para alternar visibilidad de la contraseña
function togglePasswordVisibility(fieldId, toggleButton) {
    const passwordField = document.getElementById(fieldId);
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleButton.textContent = '🙈'; // Cambiar icono a "ocultar"
    } else {
        passwordField.type = 'password';
        toggleButton.textContent = '👁️'; // Cambiar icono a "mostrar"
    }
}

// Validar contraseña segura
function isPasswordStrong(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar
    );
}

// Verificar los campos del formulario
function verificarCampos() {
    const idUser = document.getElementById('id-user').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    const botonGuardar = document.getElementById('guardar-credenciales-btn');
    const mensajeErrorPassword = document.getElementById('mensaje-error-password');

    // Validar si la contraseña es segura
    if (!isPasswordStrong(password)) {
        mensajeErrorPassword.style.display = 'block';
        botonGuardar.disabled = true;
        return;
    } else {
        mensajeErrorPassword.style.display = 'none';
    }

    // Validar que todos los campos estén completos y las contraseñas coincidan
    botonGuardar.disabled = !(
        idUser &&
        email &&
        password &&
        confirmPassword &&
        password === confirmPassword
    );
}

// Guardar las credenciales
async function guardarCredenciales() {
    const token = localStorage.getItem('token');
    const idUser = document.getElementById('id-user').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Deseas guardar estas credenciales?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`${apiURL_credentials}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                idUser,
                email,
                password,
                confirmPassword,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            Swal.fire('Éxito', 'Credenciales creadas exitosamente', 'success').then(() => {
                window.location.reload();
            });
        } else {
            throw new Error(data.error || 'Error desconocido');
        }
    } catch (error) {
        Swal.fire('Error', `No se pudieron guardar las credenciales: ${error.message}`, 'error');
    }
}
