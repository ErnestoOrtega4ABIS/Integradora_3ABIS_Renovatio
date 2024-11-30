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
            window.location.href = '../login/index.html';
        });
        return;
    }

    let userId;
    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar el token
        userId = payload.IDUser; // Obtener el ID del usuario logeado
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

    document.getElementById('email').addEventListener('input', verificarCampos);
    document.getElementById('password').addEventListener('input', verificarCampos);
    document.getElementById('confirm-password').addEventListener('input', verificarCampos);
    document.getElementById('guardar-credenciales-btn').addEventListener('click', (e) => {
        e.preventDefault();
        actualizarCredenciales(userId);
    });

    verificarCampos();
});

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
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    const botonGuardar = document.getElementById('guardar-credenciales-btn');
    const mensajeErrorPassword = document.getElementById('mensaje-error-password');

    // Validar si la contraseña es segura
    if (password && !isPasswordStrong(password)) {
        mensajeErrorPassword.style.display = 'block';
        botonGuardar.disabled = true;
        return;
    } else {
        mensajeErrorPassword.style.display = 'none';
    }

    // Habilitar el botón solo si los campos están completos y las contraseñas coinciden
    botonGuardar.disabled = !(
        email &&
        (!password || (password === confirmPassword))
    );
}

// Actualizar las credenciales
async function actualizarCredenciales(userId) {
    const token = localStorage.getItem('token');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Deseas actualizar tus credenciales?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`${apiURL_credentials}/update/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                email,
                password,
                confirmPassword,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            Swal.fire('Éxito', 'Tus credenciales se han actualizado correctamente.', 'success').then(() => {
                window.location.reload();
            });
        } else {
            throw new Error(data.error || 'Error desconocido');
        }
    } catch (error) {
        Swal.fire('Error', `No se pudieron actualizar las credenciales: ${error.message}`, 'error');
    }
}
