import { apiURL_employee } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    validateToken(() => {
        const employeeId = getEmployeeIdFromURL();
        if (employeeId) loadEmployeeData(employeeId);

        const form = document.getElementById('form-empleado');
        if (form) {
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => input.addEventListener('input', validateFields));

            document.getElementById('telefono-empleado').addEventListener('input', validatePhone);
            document.getElementById('celular-empleado').addEventListener('input', validateCellphone);
            document.getElementById('codigo-postal-empleado').addEventListener('input', validatePostalCode);

            const saveButton = document.getElementById('guardar-empleado-btn');
            if (saveButton) saveButton.addEventListener('click', updateEmployee);
        }
    });
});

function validateToken(callback) {
    const token = localStorage.getItem('token');
    if (!token) {
        Swal.fire('Error', 'No estás autenticado. Por favor, inicia sesión.', 'error')
            .then(() => window.location.href = '../../login/index.html');
        return;
    }
    callback();
}

function getEmployeeIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadEmployeeData(employeeId) {
    try {
        const response = await fetch(`${apiURL_employee}/read/${employeeId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('No se pudo cargar el empleado.');
        const employee = await response.json();

        document.getElementById('nombre-empleado').value = employee.Name || '';
        document.getElementById('apellido-paterno-empleado').value = employee.LastName || '';
        document.getElementById('apellido-materno-empleado').value = employee.SurName || '';
        document.getElementById('genero-empleado').value = employee.Gender || '';
        document.getElementById('telefono-empleado').value = employee.Phone || '';
        document.getElementById('celular-empleado').value = employee.Cellphone || '';
        document.getElementById('correo-empleado').value = employee.Email || '';
        document.getElementById('colonia-empleado').value = employee.Neighborhood || '';
        document.getElementById('direccion-empleado').value = employee.Address || '';
        document.getElementById('codigo-postal-empleado').value = employee.CP || '';
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

function validateFields() {
    const inputs = document.querySelectorAll('#form-empleado input, #form-empleado select');
    const hasErrors = Array.from(inputs).some(input => input.value.trim() === '' || input.classList.contains('error'));
    document.getElementById('guardar-empleado-btn').disabled = hasErrors;
}


function validatePhone() {
    const phoneInput = document.getElementById('telefono-empleado');
    const errorSpan = document.getElementById('error-telefono');
    if (phoneInput.value.length !== 10) {
        errorSpan.textContent = 'El teléfono debe tener exactamente 10 dígitos.';
        phoneInput.classList.add('error');
    } else {
        errorSpan.textContent = '';
        phoneInput.classList.remove('error');
    }
    validateFields();
}

function validateCellphone() {
    const cellphoneInput = document.getElementById('celular-empleado');
    const errorSpan = document.getElementById('error-celular');
    if (cellphoneInput.value.length !== 10) {
        errorSpan.textContent = 'El celular debe tener exactamente 10 dígitos.';
        cellphoneInput.classList.add('error');
    } else {
        errorSpan.textContent = '';
        cellphoneInput.classList.remove('error');
    }
    validateFields();
}

function validatePostalCode() {
    const postalCodeInput = document.getElementById('codigo-postal-empleado');
    const errorSpan = document.getElementById('error-cp');
    if (postalCodeInput.value.length !== 5) {
        errorSpan.textContent = 'El código postal debe tener exactamente 5 dígitos.';
        postalCodeInput.classList.add('error');
    } else {
        errorSpan.textContent = '';
        postalCodeInput.classList.remove('error');
    }
    validateFields();
}

async function updateEmployee(e) {
    e.preventDefault();
    const employeeId = getEmployeeIdFromURL();
    const employeeData = {
        name: document.getElementById('nombre-empleado').value.trim(),
        lastName: document.getElementById('apellido-paterno-empleado').value.trim(),
        surName: document.getElementById('apellido-materno-empleado').value.trim(),
        gender: document.getElementById('genero-empleado').value.trim(),
        phone: document.getElementById('telefono-empleado').value.trim(),
        cellphone: document.getElementById('celular-empleado').value.trim(),
        email: document.getElementById('correo-empleado').value.trim(),
        neighborhood: document.getElementById('colonia-empleado').value.trim(),
        address: document.getElementById('direccion-empleado').value.trim(),
        cp: document.getElementById('codigo-postal-empleado').value.trim(),
    };

    console.log("Datos enviados al servidor:", employeeData); // Verifica los datos enviados

    try {
        // Mostrar la confirmación antes de enviar la solicitud
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Estás a punto de actualizar la información del empleado. ¿Deseas continuar?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        });

        if (!result.isConfirmed) {
            Swal.fire('Cancelado', 'La operación de actualización ha sido cancelada.', 'info');
            return;
        }

        const response = await fetch(`${apiURL_employee}/update/${employeeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
            const errorResponse = await response.json(); // Obtén el mensaje de error del backend
            throw new Error(errorResponse.error || 'No se pudo actualizar el empleado.');
        }

        Swal.fire('Éxito', 'Empleado actualizado correctamente.', 'success')
            .then(() => window.location.href = '../empleados.html');
    } catch (error) {
        console.error("Error en la solicitud:", error.message);
        Swal.fire('Error', error.message, 'error');
    }
}





document.getElementById('telefono-empleado').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, '').slice(0, 10); // Elimina caracteres no numéricos y limita a 10 dígitos
});

document.getElementById('celular-empleado').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, '').slice(0, 10); // Elimina caracteres no numéricos y limita a 10 dígitos
});

document.getElementById('codigo-postal-empleado').addEventListener('input', function (e) {
    const input = e.target;
    input.value = input.value.replace(/\D/g, '').slice(0, 10); // Elimina caracteres no numéricos y limita a 10 dígitos
});