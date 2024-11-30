import { apiURL_project } from '../config.js';

window.mostrarDetallesCliente = mostrarDetallesCliente;
window.guardarProyecto = guardarProyecto;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    // Validar el token antes de continuar
    if (!token || isTokenExpired(token)) {
        Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Por favor, inicia sesión nuevamente.',
            confirmButtonText: 'Aceptar',
        }).then(() => {
            localStorage.removeItem('token');
            window.location.href = '../../login/index.html'; // Ajusta según tu estructura
        });
        return;
    }

    console.log("Cargando tipos de proyecto y clientes...");
    loadProjectTypes();
    loadClients();

    document.getElementById('nombre-proyecto').addEventListener('input', verificarCampos);
    document.getElementById('area-proyecto').addEventListener('input', verificarCampos);
    document.getElementById('fecha-inicio-proyecto').addEventListener('input', verificarCampos);
    document.getElementById('fecha-fin-proyecto').addEventListener('input', verificarCampos);
    document.getElementById('cliente-correo-proyecto').addEventListener('change', verificarCampos);
    document.getElementById('tipo-proyecto').addEventListener('change', verificarCampos);

    verificarCampos();
});

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
        return payload.exp < currentTime; // Retorna `true` si el token está expirado
    } catch (e) {
        console.error('Error al decodificar el token:', e);
        return true; // Asumir que está expirado si ocurre un error
    }
}

function verificarCampos() {
    const nombre = document.getElementById('nombre-proyecto').value;
    const area = document.getElementById('area-proyecto').value;
    const fechaInicio = document.getElementById('fecha-inicio-proyecto').value;
    const fechaFin = document.getElementById('fecha-fin-proyecto').value;
    const clienteId = document.getElementById('cliente-correo-proyecto').value;
    const tipoProyecto = document.getElementById('tipo-proyecto').value;

    const botonGuardar = document.getElementById('guardar-proyecto-btn');
    const mensajeErrorInicio = document.getElementById('mensaje-error-fecha');
    const mensajeErrorFin = document.getElementById('mensaje-error-fecha-fin');

    // Validar fecha de inicio
    const fechaActual = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
    if (fechaInicio && fechaInicio < fechaActual) {
        mensajeErrorInicio.style.display = 'inline'; // Muestra el mensaje
    } else {
        mensajeErrorInicio.style.display = 'none'; // Oculta el mensaje
    }

    // Validar fecha de fin
    if (fechaFin && fechaInicio && fechaFin <= fechaInicio) {
        mensajeErrorFin.style.display = 'inline'; // Muestra el mensaje
    } else {
        mensajeErrorFin.style.display = 'none'; // Oculta el mensaje
    }

    // Habilitar/deshabilitar botón según validaciones
    botonGuardar.disabled = !(
        nombre &&
        area &&
        fechaInicio &&
        fechaFin &&
        clienteId &&
        tipoProyecto &&
        fechaInicio >= fechaActual && // Validación fecha de inicio >= actual
        fechaFin > fechaInicio // Validación fecha de fin > inicio
    );
}


// Cargar tipos de proyecto
async function loadProjectTypes() {
    const token = localStorage.getItem('token');
    const projectTypeSelect = document.getElementById('tipo-proyecto');

    if (!projectTypeSelect) {
        console.error('Elemento con ID "tipo-proyecto" no encontrado en el DOM');
        return;
    }

    try {
        const response = await fetch(`${apiURL_project}/project-types`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const projectTypes = await response.json();

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

// Cargar clientes
async function loadClients() {
    const token = localStorage.getItem('token');
    const clientSelect = document.getElementById('cliente-correo-proyecto');

    if (!clientSelect) {
        console.error('Elemento con ID "cliente-correo-proyecto" no encontrado en el DOM');
        return;
    }

    try {
        const response = await fetch(`${apiURL_project}/clients`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const clients = await response.json();

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

// Mostrar detalles del cliente seleccionado
function mostrarDetallesCliente() {
    const clientSelect = document.getElementById('cliente-correo-proyecto');
    const selectedOption = clientSelect.options[clientSelect.selectedIndex];
    document.getElementById('cliente-nombre-proyecto').value = `${selectedOption.dataset.name || ''} ${selectedOption.dataset.lastname || ''}`.trim();
    document.getElementById('cliente-telefono-proyecto').value = selectedOption.dataset.phone || '';
}

// Guardar proyecto con confirmación
async function guardarProyecto() {
    const token = localStorage.getItem('token');
    const nombre = document.getElementById('nombre-proyecto').value;
    const area = document.getElementById('area-proyecto').value;
    const fechaInicio = document.getElementById('fecha-inicio-proyecto').value;
    const fechaFin = document.getElementById('fecha-fin-proyecto').value;
    const clienteId = document.getElementById('cliente-correo-proyecto').value;
    const tipoProyecto = document.getElementById('tipo-proyecto').value;

    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Deseas guardar este proyecto?",
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
        const response = await fetch(`${apiURL_project}/create`, {
            method: 'POST',
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
                status: 'Active',
            }),
        });

        const data = await response.json();
        if (response.ok) {
            Swal.fire('Éxito', 'Proyecto creado exitosamente', 'success').then(() => {
                window.location.href = "../proyectos.html";
            });
        } else {
            throw new Error(data.error || 'Error desconocido');
        }
    } catch (error) {
        Swal.fire('Error', `No se pudo guardar el proyecto: ${error.message}`, 'error');
    }
}

// Eventos
document.getElementById('cliente-correo-proyecto').addEventListener('change', mostrarDetallesCliente);
document.getElementById('guardar-proyecto-btn').addEventListener('click', (e) => {
    e.preventDefault();
    guardarProyecto();
});
