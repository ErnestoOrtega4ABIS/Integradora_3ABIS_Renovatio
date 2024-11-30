import { apiURL_client } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    const formInputs = document.querySelectorAll('#form-cliente input, #form-cliente select');
    const saveButton = document.getElementById('guardar-cliente-btn');

    validateToken(() => {
        // Solo habilitar funcionalidad si el token es válido
        formInputs.forEach(input => {
            input.addEventListener('input', verificarCampos);
        });

        document.getElementById('telefono-cliente').addEventListener('input', validarTelefono);
        document.getElementById('celular-cliente').addEventListener('input', validarCelular);
        document.getElementById('codigo-postal-cliente').addEventListener('input', validarCP);

        saveButton.addEventListener('click', (e) => {
            e.preventDefault();
            guardarCliente();
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

        // Si el token es válido, ejecuta la función de callback
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

// Verificar si todos los campos están llenos y válidos
function verificarCampos() {
    const inputs = document.querySelectorAll('#form-cliente input, #form-cliente select');
    const allFilled = Array.from(inputs).every(input => input.value.trim() !== '' && !input.classList.contains('invalid'));
    document.getElementById('guardar-cliente-btn').disabled = !allFilled;
}

// Validar el teléfono
function validarTelefono() {
    const telefonoInput = document.getElementById('telefono-cliente');
    const errorSpan = document.getElementById('error-telefono');
    const telefono = telefonoInput.value.replace(/\D/g, '');

    if (telefono.length !== 10) {
        errorSpan.textContent = 'El número debe contener exactamente 10 dígitos.';
        errorSpan.style.display = 'block';
        telefonoInput.classList.add('invalid');
    } else {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
        telefonoInput.classList.remove('invalid');
    }

    verificarCampos();
}

// Validar el celular
function validarCelular() {
    const celularInput = document.getElementById('celular-cliente');
    const errorSpan = document.getElementById('error-celular');
    const celular = celularInput.value.replace(/\D/g, '');

    if (celular.length !== 10) {
        errorSpan.textContent = 'El celular debe contener exactamente 10 dígitos.';
        errorSpan.style.display = 'block';
        celularInput.classList.add('invalid');
    } else {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
        celularInput.classList.remove('invalid');
    }

    verificarCampos();
}

// Validar el código postal
function validarCP() {
    const cpInput = document.getElementById('codigo-postal-cliente');
    const errorSpan = document.getElementById('error-cp');
    const cp = cpInput.value.replace(/\D/g, '');

    if (cp.length !== 5) {
        errorSpan.textContent = 'El código postal debe contener exactamente 5 dígitos.';
        errorSpan.style.display = 'block';
        cpInput.classList.add('invalid');
    } else {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
        cpInput.classList.remove('invalid');
    }

    verificarCampos();
}

// Enviar datos al servidor
async function guardarCliente() {
    const cliente = {
        name: document.getElementById('nombre-cliente').value.trim(),
        lastName: document.getElementById('apellido-paterno-cliente').value.trim(),
        surName: document.getElementById('apellido-materno-cliente').value.trim(),
        gender: document.getElementById('genero-cliente').value,
        phone: document.getElementById('telefono-cliente').value.trim(),
        cellphone: document.getElementById('celular-cliente').value.trim(),
        email: document.getElementById('correo-cliente').value.trim(),
        neighborhood: document.getElementById('colonia-cliente').value.trim(),
        address: document.getElementById('direccion-cliente').value.trim(),
        cp: document.getElementById('codigo-postal-cliente').value.trim(),
    };

    try {
        const token = localStorage.getItem('token');
        const result = await Swal.fire({
            title: '¿Confirmar registro?',
            text: '¿Deseas registrar este cliente?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar cliente',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        });

        if (result.isConfirmed) {
            const response = await fetch(`${apiURL_client}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Enviar el token en la solicitud
                },
                body: JSON.stringify(cliente),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire('Éxito', 'Cliente agregado correctamente.', 'success')
                    .then(() => window.location.href = '../clientes.html');
            } else {
                Swal.fire('Error', result.error || 'No se pudo agregar el cliente.', 'error');
            }
        } else {
            Swal.fire('Cancelado', 'El cliente no fue registrado.', 'info');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        Swal.fire('Error', 'Error de conexión.', 'error');
    }
}


// Validar los campos del formulario
document.getElementById('telefono-cliente').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, '');
    if (input.value.length != 10) {
        input.setCustomValidity('El número debe contener exactamente 10 dígitos');
    } else {
        input.setCustomValidity('');
    }
});

document.getElementById('celular-cliente').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, '');
    if (input.value.length != 10) {
        input.setCustomValidity('El número debe contener exactamente 10 dígitos');
    } else {
        input.setCustomValidity('');
    }
});

document.getElementById('codigo-postal-cliente').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, '');
    if (input.value.length !== 5) {
        input.setCustomValidity('El código postal debe contener exactamente 5 dígitos');
    } else {
        input.setCustomValidity('');
    }
});
