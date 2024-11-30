import { apiURL_assignment } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    validateToken(() => {
        const assignmentId = new URLSearchParams(window.location.search).get('id');
        cargarEmpleados().then(() => cargarProyectos().then(() => cargarAsignacion(assignmentId)));

        document.getElementById('asignacion-empleado-select').addEventListener('change', actualizarDatosEmpleado);
        document.getElementById('asignacion-proyecto-select').addEventListener('change', actualizarDatosProyecto);

        document.getElementById('assignment-date').addEventListener('input', () => {
            validarFecha();
            verificarCampos();
        });

        document.getElementById('form-asignacion').addEventListener('submit', (e) => {
            e.preventDefault();
            guardarCambios(assignmentId);
        });
    });
});

// Validar el token antes de ejecutar cualquier acción
function validateToken(callback) {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlertAndRedirect('No se encontró un token válido. Por favor, inicia sesión nuevamente.');
        return;
    }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp < currentTime) {
            showAlertAndRedirect('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            return;
        }

        callback();
    } catch (err) {
        console.error('Error al validar el token:', err);
        showAlertAndRedirect('Token inválido o corrupto. Por favor, inicia sesión nuevamente.');
    }
}

function showAlertAndRedirect(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: message,
    }).then(() => {
        localStorage.removeItem('token');
        window.location.href = '../../../login/index.html';
    });
}

// Cargar datos existentes de la asignación
async function cargarAsignacion(assignmentId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${apiURL_assignment}/read/${assignmentId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const data = await response.json();
        console.log('Datos de la asignación:', data);

        // Asignar valores a los campos
        document.getElementById('asignacion-empleado-select').value = data.IDEmployee;
        document.getElementById('asignacion-empleado-nombre').value = `${data.EmployeeName} ${data.EmployeeLastName}`;
        document.getElementById('asignacion-empleado-telefono').value = data.EmployeePhone;
        document.getElementById('asignacion-proyecto-select').value = data.IDProject;
        document.getElementById('asignacion-proyecto-area').value = data.ProjectArea;
        document.getElementById('asignacion-proyecto-cliente').value = data.ClientName;
        document.getElementById('assignment-date').value = data.AssignmentDate.split('T')[0];

        // Establecer la fecha mínima permitida
        document.getElementById('assignment-date').setAttribute('min', data.AssignmentDate.split('T')[0]);

        verificarCampos();
    } catch (error) {
        console.error('Error al cargar asignación:', error);
        Swal.fire('Error', 'No se pudo cargar la asignación.', 'error');
    }
}

// Cargar empleados
async function cargarEmpleados() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${apiURL_assignment}/employees`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const empleados = await response.json();
        console.log('Empleados cargados:', empleados);

        const selectEmpleado = document.getElementById('asignacion-empleado-select');
        empleados.forEach((empleado) => {
            const option = document.createElement('option');
            option.value = empleado.EmployeeID;
            option.textContent = empleado.EmployeeEmail;
            option.dataset.name = `${empleado.EmployeeName} ${empleado.EmployeeLastName}`;
            option.dataset.phone = empleado.EmployeePhone;
            selectEmpleado.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar empleados:', error);
        Swal.fire('Error', 'No se pudieron cargar los empleados.', 'error');
    }
}

// Cargar proyectos
async function cargarProyectos() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${apiURL_assignment}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const proyectos = await response.json();
        console.log('Proyectos cargados:', proyectos);

        const selectProyecto = document.getElementById('asignacion-proyecto-select');
        proyectos.forEach((proyecto) => {
            const option = document.createElement('option');
            option.value = proyecto.IDProject;
            option.textContent = proyecto.ProjectName;
            option.dataset.area = proyecto.ProjectArea;
            option.dataset.client = proyecto.ClientName;
            selectProyecto.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar proyectos:', error);
        Swal.fire('Error', 'No se pudieron cargar los proyectos.', 'error');
    }
}

// Validar fecha y habilitar/deshabilitar botón
function validarFecha() {
    const dateInput = document.getElementById('assignment-date');
    const dateWarning = document.getElementById('date-warning');
    const guardarBtn = document.getElementById('guardar-asignacion-btn');
    const minDate = dateInput.getAttribute('min');
    if (new Date(dateInput.value) < new Date(minDate)) {
        dateWarning.style.display = 'inline';
        guardarBtn.disabled = true;
    } else {
        dateWarning.style.display = 'none';
        verificarCampos(); // Verificar campos una vez que la fecha sea válida
    }
}

// Guardar cambios en la asignación
async function guardarCambios(assignmentId) {
    const token = localStorage.getItem('token');
    const idEmployee = document.getElementById('asignacion-empleado-select').value;
    const idProject = document.getElementById('asignacion-proyecto-select').value;
    const assignmentDate = document.getElementById('assignment-date').value;
    const status = 'Active';

    if (!assignmentDate) {
        return Swal.fire('Error', 'La fecha de asignación es obligatoria.', 'error');
    }

    try {
        const result = await Swal.fire({
            title: '¿Guardar cambios?',
            text: '¿Deseas guardar los cambios en esta asignación?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        });

        if (result.isConfirmed) {
            const response = await fetch(`${apiURL_assignment}/update/${assignmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ idEmployee, idProject, assignmentDate, status }),
            });

            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

            Swal.fire('Éxito', 'Asignación actualizada correctamente.', 'success').then(() =>
                window.location.href = '../asignaciones.html'
            );
        }
    } catch (error) {
        console.error('Error al guardar cambios:', error);
        Swal.fire('Error', 'No se pudo guardar los cambios.', 'error');
    }
}

// Actualizar datos del empleado
function actualizarDatosEmpleado() {
    const selectEmpleado = document.getElementById('asignacion-empleado-select');
    const empleadoSeleccionado = selectEmpleado.options[selectEmpleado.selectedIndex];
    if (empleadoSeleccionado) {
        document.getElementById('asignacion-empleado-nombre').value = empleadoSeleccionado.dataset.name || '';
        document.getElementById('asignacion-empleado-telefono').value = empleadoSeleccionado.dataset.phone || '';
    }
}

// Actualizar datos del proyecto
function actualizarDatosProyecto() {
    const selectProyecto = document.getElementById('asignacion-proyecto-select');
    const proyectoSeleccionado = selectProyecto.options[selectProyecto.selectedIndex];
    if (proyectoSeleccionado) {
        document.getElementById('asignacion-proyecto-area').value = proyectoSeleccionado.dataset.area || '';
        document.getElementById('asignacion-proyecto-cliente').value = proyectoSeleccionado.dataset.client || '';
    }
}

// Verificar si los campos están completos
function verificarCampos() {
    const employeeSelect = document.getElementById('asignacion-empleado-select').value;
    const projectSelect = document.getElementById('asignacion-proyecto-select').value;
    const assignmentDate = document.getElementById('assignment-date').value;
    const guardarBtn = document.getElementById('guardar-asignacion-btn');
    guardarBtn.disabled = !(employeeSelect && projectSelect && assignmentDate);
}
