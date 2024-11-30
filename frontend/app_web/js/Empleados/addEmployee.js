import { apiURL_employee } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    validateToken(() => {
        const formInputs = document.querySelectorAll('#form-empleado input, #form-empleado select');
        const saveButton = document.getElementById('guardar-empleado-btn');

        formInputs.forEach(input => {
            input.addEventListener('input', verificarCampos);
        });

        document.getElementById('telefono-empleado').addEventListener('input', () => validarCampoNumerico('telefono-empleado', 10, 'El número debe contener exactamente 10 dígitos', 'error-telefono'));
        document.getElementById('celular-empleado').addEventListener('input', () => validarCampoNumerico('celular-empleado', 10, 'El celular debe contener exactamente 10 dígitos', 'error-celular'));
        document.getElementById('codigo-postal-empleado').addEventListener('input', () => validarCampoNumerico('codigo-postal-empleado', 5, 'El código postal debe contener exactamente 5 dígitos', 'error-cp'));

        saveButton.addEventListener('click', (e) => {
            e.preventDefault();
            guardarEmpleado();
        });
    });
});

// Validar el token
function validateToken(callback) {
    const token = localStorage.getItem('token');

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'No se encontró un token válido. Por favor, inicia sesión nuevamente.',
        }).then(() => {
            window.location.href = '../../login/index.html';
        });
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp < currentTime) {
            Swal.fire({
                icon: 'warning',
                title: 'Sesión expirada',
                text: 'Por favor, inicia sesión nuevamente.',
            }).then(() => {
                window.location.href = '../../login/index.html';
            });
            return;
        }

        callback();
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'Token inválido o corrupto. Por favor, inicia sesión nuevamente.',
        }).then(() => {
            window.location.href = '../../login/index.html';
        });
    }
}

// Verificar si todos los campos están llenos y si no hay errores
function verificarCampos() {
    const inputs = document.querySelectorAll('#form-empleado input, #form-empleado select');
    const errorSpans = document.querySelectorAll('.error-msg');
    const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
    const noErrors = Array.from(errorSpans).every(span => span.textContent === '');
    document.getElementById('guardar-empleado-btn').disabled = !(allFilled && noErrors);
}

// Validar campo numérico con mensajes en spans
function validarCampoNumerico(inputId, maxLength, errorMsg, spanId) {
    const input = document.getElementById(inputId);
    const span = document.getElementById(spanId);
    const value = input.value.replace(/\D/g, ''); // Eliminar caracteres no numéricos

    input.value = value.slice(0, maxLength); // Limitar longitud
    if (value.length !== maxLength) {
        span.textContent = errorMsg;
        input.classList.add('invalid');
    } else {
        span.textContent = '';
        input.classList.remove('invalid');
    }

    verificarCampos();
}

// Guardar empleado
async function guardarEmpleado() {
    const empleado = {
        name: document.getElementById('nombre-empleado').value.trim(),
        lastName: document.getElementById('apellido-paterno-empleado').value.trim(),
        surName: document.getElementById('apellido-materno-empleado').value.trim(),
        gender: document.getElementById('genero-empleado').value,
        phone: document.getElementById('telefono-empleado').value.trim(),
        cellphone: document.getElementById('celular-empleado').value.trim(),
        email: document.getElementById('correo-empleado').value.trim(),
        neighborhood: document.getElementById('colonia-empleado').value.trim(),
        address: document.getElementById('direccion-empleado').value.trim(),
        cp: document.getElementById('codigo-postal-empleado').value.trim(),
    };

    try {
        const token = localStorage.getItem('token');
        const result = await Swal.fire({
            title: '¿Confirmar registro?',
            text: '¿Deseas registrar este empleado?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar empleado',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        });

        if (result.isConfirmed) {
            const response = await fetch(`${apiURL_employee}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(empleado),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire('Éxito', 'Empleado agregado correctamente.', 'success')
                    .then(() => window.location.href = '../empleados.html');
            } else {
                Swal.fire('Error', result.error || 'No se pudo agregar el empleado.', 'error');
            }
        } else {
            Swal.fire('Cancelado', 'El empleado no fue registrado.', 'info');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        Swal.fire('Error', 'Error de conexión.', 'error');
    }
}



document.getElementById('telefono').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, '').slice(0, 10); // Elimina caracteres no numéricos y limita a 10 dígitos
});

document.getElementById('celular').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, '').slice(0, 10); // Elimina caracteres no numéricos y limita a 10 dígitos
});

document.getElementById('codigo-postal').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, '').slice(0, 10); // Elimina caracteres no numéricos y limita a 10 dígitos
});