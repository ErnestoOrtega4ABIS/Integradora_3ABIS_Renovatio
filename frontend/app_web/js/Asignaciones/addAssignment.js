import { apiURL_assignment } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    validateToken(() => {
        cargarEmpleados();
        cargarProyectos();
    });

    document.getElementById('asignacion-empleado-select').addEventListener('change', () => {
        actualizarDatosEmpleado();
        verificarCampos();
    });

    document.getElementById('asignacion-proyecto-select').addEventListener('change', () => {
        actualizarDatosProyecto();
        verificarCampos();
    });

    document.getElementById('guardar-asignacion-btn').addEventListener('click', guardarAsignacion);
});

// Validar el token antes de ejecutar cualquier acción
function validateToken(callback) {
    const token = localStorage.getItem('token');

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'No se encontró un token válido. Por favor, inicia sesión nuevamente.',
        }).then(() => {
            window.location.href = '../../login/index.html'; // Redirigir al login si no hay token
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

        callback(); // Ejecutar el callback si el token es válido
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

// Cargar empleados en el selector
async function cargarEmpleados() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${apiURL_assignment}/employees`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Error al cargar empleados');
        const empleados = await response.json();

        const selectEmpleado = document.getElementById('asignacion-empleado-select');
        empleados.forEach(empleado => {
            const option = document.createElement('option');
            option.value = empleado.EmployeeID;
            option.textContent = `${empleado.EmployeeName} (${empleado.EmployeeEmail})`;
            option.dataset.name = `${empleado.EmployeeName} ${empleado.EmployeeLastName}`;
            option.dataset.phone = empleado.EmployeePhone;
            selectEmpleado.appendChild(option);
        });

        verificarCampos();
    } catch (error) {
        console.error('Error al cargar empleados:', error);
        Swal.fire('Error', 'No se pudieron cargar los empleados. Intenta más tarde.', 'error');
    }
}

// Cargar proyectos en el selector
async function cargarProyectos() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${apiURL_assignment}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Error al cargar proyectos');
        const proyectos = await response.json();

        const selectProyecto = document.getElementById('asignacion-proyecto-select');
        proyectos.forEach(proyecto => {
            const option = document.createElement('option');
            option.value = proyecto.IDProject;
            option.textContent = proyecto.ProjectName;
            option.dataset.area = proyecto.ProjectArea;
            option.dataset.client = proyecto.ClientName;
            selectProyecto.appendChild(option);
        });

        verificarCampos();
    } catch (error) {
        console.error('Error al cargar proyectos:', error);
        Swal.fire('Error', 'No se pudieron cargar los proyectos. Intenta más tarde.', 'error');
    }
}

// Actualizar datos del empleado seleccionado
function actualizarDatosEmpleado() {
    const selectEmpleado = document.getElementById('asignacion-empleado-select');
    const empleadoSeleccionado = selectEmpleado.options[selectEmpleado.selectedIndex];

    if (empleadoSeleccionado) {
        document.getElementById('asignacion-empleado-nombre').value = empleadoSeleccionado.dataset.name || '';
        document.getElementById('asignacion-empleado-telefono').value = empleadoSeleccionado.dataset.phone || '';
    }
}

// Actualizar datos del proyecto seleccionado
function actualizarDatosProyecto() {
    const selectProyecto = document.getElementById('asignacion-proyecto-select');
    const proyectoSeleccionado = selectProyecto.options[selectProyecto.selectedIndex];

    if (proyectoSeleccionado) {
        document.getElementById('asignacion-proyecto-area').value = proyectoSeleccionado.dataset.area || '';
        document.getElementById('asignacion-proyecto-cliente').value = proyectoSeleccionado.dataset.client || '';
    }
}

// Guardar asignación
async function guardarAsignacion(e) {
    e.preventDefault();

    const idEmployee = document.getElementById('asignacion-empleado-select').value;
    const idProject = document.getElementById('asignacion-proyecto-select').value;

    if (!idEmployee || !idProject) {
        return Swal.fire('Error', 'Debe seleccionar un empleado y un proyecto.', 'error');
    }

    const token = localStorage.getItem('token');
    try {
        const result = await Swal.fire({
            title: '¿Confirmar asignación?',
            text: "¿Deseas asignar este proyecto al empleado seleccionado?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, asignar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        });

        if (result.isConfirmed) {
            const response = await fetch(`${apiURL_assignment}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ idEmployee, idProject }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Éxito', 'Asignación creada exitosamente.', 'success')
                    .then(() => window.location.href = '../asignaciones.html');
            } else {
                Swal.fire('Error', data.error || 'No se pudo crear la asignación.', 'error');
            }
        } else {
            Swal.fire('Cancelado', 'La asignación no fue creada.', 'info');
        }
    } catch (error) {
        console.error('Error al guardar la asignación:', error);
        Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
    }
}

// Verificar si todos los campos están llenos para habilitar el botón de guardar
function verificarCampos() {
    const employeeSelect = document.getElementById('asignacion-empleado-select');
    const projectSelect = document.getElementById('asignacion-proyecto-select');
    const guardarBtn = document.getElementById('guardar-asignacion-btn');

    if (employeeSelect.value.trim() !== '' && projectSelect.value.trim() !== '') {
        guardarBtn.disabled = false; // Habilitar botón
    } else {
        guardarBtn.disabled = true; // Deshabilitar botón
    }
}
