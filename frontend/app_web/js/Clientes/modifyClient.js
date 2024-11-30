import { apiURL_client } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Validar el token antes de cargar la página
    validateToken(() => {
        const clientId = new URLSearchParams(window.location.search).get('id');
        if (clientId) {
            cargarDatosCliente(clientId);
        }

        // Manejar el envío del formulario
        document.getElementById('form-cliente').addEventListener('submit', (e) => {
            e.preventDefault();
            guardarCambios(clientId);
        });

        // Validar campos específicos
        document.getElementById('telefono-cliente').addEventListener('input', validarTelefono);
        document.getElementById('celular-cliente').addEventListener('input', validarCelular);
        document.getElementById('codigo-postal-cliente').addEventListener('input', validarCP);

        // Verificar todos los campos para habilitar/deshabilitar el botón
        const formInputs = document.querySelectorAll('#form-cliente input, #form-cliente select');
        formInputs.forEach(input => {
            input.addEventListener('input', verificarCampos);
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

// Función para cargar los datos del cliente
async function cargarDatosCliente(clientId) {
    try {
        const response = await fetch(`${apiURL_client}/read/${clientId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Error al cargar datos del cliente');

        const cliente = await response.json();

        // Rellenar los campos del formulario con los datos del cliente
        document.getElementById('nombre-cliente').value = cliente.Name || '';
        document.getElementById('apellido-paterno-cliente').value = cliente.LastName || '';
        document.getElementById('apellido-materno-cliente').value = cliente.SurName || '';
        document.getElementById('genero-cliente').value = cliente.Gender || '';
        document.getElementById('telefono-cliente').value = cliente.Phone || '';
        document.getElementById('celular-cliente').value = cliente.Cellphone || '';
        document.getElementById('correo-cliente').value = cliente.Email || '';
        document.getElementById('colonia-cliente').value = cliente.Neighborhood || '';
        document.getElementById('direccion-cliente').value = cliente.Address || '';
        document.getElementById('codigo-postal-cliente').value = cliente.CP || '';
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

// Función para verificar si todos los campos están llenos y válidos
function verificarCampos() {
    const inputs = document.querySelectorAll('#form-cliente input, #form-cliente select');
    const allFilled = Array.from(inputs).every(input => input.value.trim() !== '' && !input.classList.contains('invalid'));
    document.getElementById('guardarClienteBtn').disabled = !allFilled;
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

// Función para guardar los cambios del cliente
async function guardarCambios(clientId) {
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

    // SweetAlert de confirmación
    const result = await Swal.fire({
        title: 'Confirmar Modificación',
        text: "¿Deseas actualizar los datos del cliente?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${apiURL_client}/update/${clientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(cliente)
            });

            if (response.ok) {
                Swal.fire('Éxito', 'Cliente actualizado correctamente', 'success')
                    .then(() => window.location.href = "../clientes.html");
            } else {
                const error = await response.json();
                Swal.fire('Error', error.message || 'No se pudo actualizar el cliente', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Error de conexión al servidor', 'error');
        }
    } else {
        Swal.fire('Cancelado', 'No se realizaron cambios', 'info');
    }
}



document.getElementById('telefono').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, ''); // Elimina caracteres no numéricos
    if (input.value.length !== 10) {
        input.setCustomValidity('El número debe contener exactamente 10 dígitos');
    } else {
        input.setCustomValidity('');
    }
});

document.getElementById('celular').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, ''); // Elimina caracteres no numéricos
    if (input.value.length !== 10) {
        input.setCustomValidity('El número debe contener exactamente 10 dígitos');
    } else {
        input.setCustomValidity('');
    }
});

document.getElementById('codigo-postal').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, ''); // Elimina caracteres no numéricos
    if (input.value.length !== 5) {
        input.setCustomValidity('El código postal debe contener exactamente 5 dígitos');
    } else {
        input.setCustomValidity('');
    }
});

