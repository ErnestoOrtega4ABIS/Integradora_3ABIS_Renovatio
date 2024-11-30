import { apiURL_assignment } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    validateToken(() => fetchAssignments(1)); // Cargar asignaciones en la página 1

    // Evento para buscar en la tabla
    document.getElementById('search-assignment').addEventListener('input', function () {
        const searchText = this.value.toLowerCase(); // Convierte el texto de búsqueda a minúsculas
        const rows = document.querySelectorAll("#tabla-asignaciones tbody tr"); // Selecciona todas las filas de la tabla

        rows.forEach(row => {
            const employeeName = row.cells[2]?.textContent.toLowerCase(); // Nombre del empleado (columna 2)
            const projectName = row.cells[4]?.textContent.toLowerCase(); // Nombre del proyecto (columna 4)

            // Verifica si el texto buscado coincide con el nombre del empleado o del proyecto
            if (
                (employeeName && employeeName.includes(searchText)) ||
                (projectName && projectName.includes(searchText))
            ) {
                row.style.display = ""; // Muestra la fila si coincide
            } else {
                row.style.display = "none"; // Oculta la fila si no coincide
            }
        });
    });
});

// Variables para paginación
let assignmentsPerPage = 5; // Número de asignaciones por página
let currentPage = 1; // Página actual
let totalAssignments = 0; // Total de asignaciones

// Validación del token
function validateToken(callback) {
    const token = localStorage.getItem('token');

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

    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar el payload
        console.log("Token Payload:", payload); // Ver el contenido del token
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp < currentTime) {
            Swal.fire({
                icon: 'warning',
                title: 'Sesión expirada',
                text: 'Por favor, inicia sesión nuevamente.',
            }).then(() => {
                window.location.href = '../login/index.html';
            });
            return;
        }

        callback();
    } catch (err) {
        console.error("Error al validar el token:", err); // Mostrar el error
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'Token inválido o corrupto. Por favor, inicia sesión nuevamente.',
        }).then(() => {
            window.location.href = '../login/index.html';
        });
    }
}

// Formatear la fecha a 'YYYY-MM-DD'
function formatFecha(fechaCompleta) {
    const fecha = new Date(fechaCompleta);
    return fecha.toISOString().split('T')[0]; // Devuelve solo la parte de la fecha
}

// Función para obtener asignaciones y llenar la tabla
async function fetchAssignments(page) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("No hay token disponible");
        return;
    }

    try {
        const response = await fetch(`${apiURL_assignment}/read?page=${page}&limit=${assignmentsPerPage}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error("Error en la respuesta del servidor:", response.status, response.statusText);
            throw new Error("Error al obtener las asignaciones. Verifica el backend.");
        }

        const data = await response.json();
        console.log("Datos de asignaciones:", data);

        totalAssignments = data.total;
        currentPage = page;
        renderAssignments(data.assignments);
        updatePaginationControls();
    } catch (error) {
        console.error("Error al cargar asignaciones:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar asignaciones',
            text: error.message || 'Error desconocido.',
        });
    }
}

// Renderizar las asignaciones en la tabla
function renderAssignments(assignments) {
    const tableBody = document.querySelector("#tabla-asignaciones tbody");
    tableBody.innerHTML = ''; // Limpiar la tabla antes de llenarla

    assignments.forEach(assignment => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${assignment.IDAssignment}</td>
            <td>${formatFecha(assignment.AssignmentDate)}</td>
            <td>${assignment.EmployeeName}</td>
            <td>${assignment.EmployeePhone}</td>
            <td>${assignment.ProjectName}</td>
            <td class="action-icons">
                <a href="../html/modificar_datos/modificar_asignacion.html?id=${assignment.IDAssignment}" class="modificar">
                    <img src="../img/boton-editar.png" alt="Editar" class="icon-img">
                </a>
                <button onclick="deleteAssignment(${assignment.IDAssignment})" class="eliminar">
                    <img src="../img/eliminar.png" alt="Eliminar" class="icon-img">
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Actualizar controles de paginación
function updatePaginationControls() {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Limpiar controles previos

    const totalPages = Math.ceil(totalAssignments / assignmentsPerPage); // Calcular el total de páginas

    // Si no hay más páginas, mostrar solo la página 1
    if (totalPages <= 1) {
        const singlePageButton = document.createElement('button');
        singlePageButton.textContent = '1';
        singlePageButton.className = 'pagination-btn active';
        paginationControls.appendChild(singlePageButton);
        return;
    }

    // Crear botón "Anterior" solo si hay más de una página
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.className = 'pagination-btn';
        prevButton.addEventListener('click', () => fetchAssignments(currentPage - 1));
        paginationControls.appendChild(prevButton);
    }

    // Crear botones numerados
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'pagination-btn active' : 'pagination-btn';
        pageButton.addEventListener('click', () => {
            if (i !== currentPage) fetchAssignments(i);
        });
        paginationControls.appendChild(pageButton);
    }

    // Crear botón "Siguiente" solo si hay más de una página
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.className = 'pagination-btn';
        nextButton.addEventListener('click', () => fetchAssignments(currentPage + 1));
        paginationControls.appendChild(nextButton);
    }
}


// Función para eliminar una asignación
window.deleteAssignment = function (assignmentId) {
    const token = localStorage.getItem('token');

    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará la asignación de manera permanente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${apiURL_assignment}/delete/${assignmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        Swal.fire('Eliminado', 'La asignación ha sido eliminada.', 'success');
                        fetchAssignments(currentPage); // Recargar las asignaciones
                    } else {
                        throw new Error(data.error || 'Error desconocido');
                    }
                })
                .catch(error => {
                    Swal.fire('Error', `No se pudo eliminar la asignación: ${error.message}`, 'error');
                });
        }
    });
};
