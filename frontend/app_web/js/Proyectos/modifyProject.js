import { apiURL_project } from '../config.js';

// Obtener el token del localStorage
const token = localStorage.getItem('token');

// Verificar si el token existe
if (!token) {
    alert('No estás autenticado. Por favor, inicia sesión.');
    window.location.href = '../../index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    const projectId = getProjectIdFromURL();
    if (projectId) {
        await loadProjectTypes();
        await loadClients();
        await loadProjectData(projectId);
    }

    document.getElementById('nombre-proyecto').addEventListener('input', verificarCampos);
    document.getElementById('area-proyecto').addEventListener('input', verificarCampos);
    document.getElementById('fecha-inicio-proyecto').addEventListener('input', verificarCampos);
    document.getElementById('fecha-fin-proyecto').addEventListener('input', verificarCampos);
    document.getElementById('cliente-proyecto').addEventListener('change', verificarCampos);
    document.getElementById('tipo-proyecto').addEventListener('change', verificarCampos);
});

// Función para obtener el ID del proyecto desde la URL
function getProjectIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Función para cargar tipos de proyecto
async function loadProjectTypes() {
    try {
        const response = await fetch(`${apiURL_project}/project-types`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const projectTypes = await response.json();

        const projectTypeSelect = document.getElementById('tipo-proyecto');
        projectTypeSelect.innerHTML = '<option value="">Seleccione un tipo de proyecto</option>';
        projectTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.IDProjectType;
            option.textContent = type.Description;
            projectTypeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar tipos de proyecto:', error);
    }
}

// Función para cargar clientes
async function loadClients() {
    try {
        const response = await fetch(`${apiURL_project}/clients`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const clients = await response.json();

        const clientSelect = document.getElementById('cliente-proyecto');
        clientSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.ClientID;
            option.textContent = client.Email;
            option.dataset.name = client.ClientName || '';
            option.dataset.lastname = client.LastName || '';
            option.dataset.phone = client.Phone || '';
            clientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

// Función para cargar los datos del proyecto
async function loadProjectData(projectId) {
    try {
        const response = await fetch(`${apiURL_project}/read/${projectId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const project = await response.json();
        populateForm(project);
    } catch (error) {
        console.error('Error al cargar los datos del proyecto:', error);
    }
}

// Función para rellenar el formulario y asignar las fechas originales como atributos
function populateForm(project) {
    document.getElementById('nombre-proyecto').value = project.ProjectName;
    document.getElementById('area-proyecto').value = project.LandArea;

    const fechaInicioInput = document.getElementById('fecha-inicio-proyecto');
    fechaInicioInput.value = project.StartDate.split('T')[0];
    fechaInicioInput.dataset.original = project.StartDate.split('T')[0];

    const fechaFinInput = document.getElementById('fecha-fin-proyecto');
    fechaFinInput.value = project.EndDate.split('T')[0];
    fechaFinInput.dataset.original = project.EndDate.split('T')[0];

    document.getElementById('cliente-proyecto').value = project.ClientID;
    document.getElementById('tipo-proyecto').value = project.ProjectTypeID;

    mostrarDetallesCliente();
}

// Mostrar detalles del cliente seleccionado
function mostrarDetallesCliente() {
    const clientSelect = document.getElementById('cliente-proyecto');
    const selectedOption = clientSelect.options[clientSelect.selectedIndex];
    if (selectedOption) {
        const nombreCompleto = `${selectedOption.dataset.name || ''} ${selectedOption.dataset.lastname || ''}`.trim();
        document.getElementById('nombre-completo-cliente').value = nombreCompleto;
        document.getElementById('telefono-cliente').value = selectedOption.dataset.phone || '';
    }
}

// Validar campos del formulario con restricciones de fecha original
function verificarCampos() {
    const nombre = document.getElementById('nombre-proyecto').value.trim();
    const area = document.getElementById('area-proyecto').value.trim();
    const fechaInicio = document.getElementById('fecha-inicio-proyecto').value;
    const fechaFin = document.getElementById('fecha-fin-proyecto').value;
    const clienteId = document.getElementById('cliente-proyecto').value;
    const tipoProyecto = document.getElementById('tipo-proyecto').value;

    const mensajeErrorInicio = document.getElementById('mensaje-error-fecha');
    const mensajeErrorFin = document.getElementById('mensaje-error-fecha-fin');
    const botonGuardar = document.getElementById('guardar-proyecto-btn');

    const fechaInicioOriginal = document.getElementById('fecha-inicio-proyecto').dataset.original || '';
    const fechaFinOriginal = document.getElementById('fecha-fin-proyecto').dataset.original || '';

    let errores = false;

    // Validar fecha de inicio
    if (fechaInicio && fechaInicio < fechaInicioOriginal) {
        mensajeErrorInicio.style.display = 'inline';
        mensajeErrorInicio.textContent = `La fecha de inicio no puede ser menor a ${fechaInicioOriginal}`;
        errores = true;
    } else {
        mensajeErrorInicio.style.display = 'none';
    }

    // Validar fecha de fin
    if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
        mensajeErrorFin.style.display = 'inline';
        mensajeErrorFin.textContent = 'La fecha de fin no puede ser menor a la fecha de inicio.';
        errores = true;
    } else {
        mensajeErrorFin.style.display = 'none';
    }

    // Validar otros campos requeridos
    if (!nombre || !area || !fechaInicio || !fechaFin || !clienteId || !tipoProyecto) {
        errores = true;
    }

    // Habilitar o deshabilitar el botón
    botonGuardar.disabled = errores;
}


// Actualizar proyecto
window.updateProject = async function updateProject() {
    const projectId = getProjectIdFromURL();
    const nombre = document.getElementById('nombre-proyecto').value;
    const area = document.getElementById('area-proyecto').value;
    const fechaInicio = document.getElementById('fecha-inicio-proyecto').value;
    const fechaFin = document.getElementById('fecha-fin-proyecto').value;
    const clienteId = document.getElementById('cliente-proyecto').value;
    const tipoProyecto = document.getElementById('tipo-proyecto').value;

    try {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas actualizar este proyecto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar',
        });

        if (!result.isConfirmed) return;

        const response = await fetch(`${apiURL_project}/update/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: nombre,
                landArea: area,
                startDate: fechaInicio,
                endDate: fechaFin,
                clientId: clienteId,
                projectTypeId: tipoProyecto,
            }),
        });

        if (!response.ok) throw new Error('No se pudo actualizar el proyecto');

        Swal.fire('Éxito', 'Proyecto actualizado exitosamente', 'success').then(() => {
            window.location.href = '../proyectos.html';
        });
    } catch (error) {
        Swal.fire('Error', `No se pudo actualizar el proyecto: ${error.message}`, 'error');
    }
};

document.getElementById('guardar-proyecto-btn').addEventListener('click', (e) => {
    e.preventDefault();
    updateProject();
});
