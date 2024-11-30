import { apiURL_project } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando paginación...");
    validateToken(() => fetchProjects(1)); // Iniciar en la página 1
});

// Variables globales para paginación
let projectsPerPage = 5; // Número de proyectos por página
let currentPage = 1; // Página actual
let totalProjects = 0; // Total de proyectos

function validateToken(callback) {
    const token = localStorage.getItem('token');

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'No se encontró un token válido. Por favor, inicia sesión nuevamente.',
        }).then(() => {
            localStorage.removeItem('token');
            window.location.href = '/login/index.html'; // Redirigir a login
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
                localStorage.removeItem('token');
                window.location.href = '/login/index.html';
            });
            return;
        }

        callback();
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'Token inválido. Por favor, inicia sesión nuevamente.',
        }).then(() => {
            localStorage.removeItem('token');
            window.location.href = '/login/index.html';
        });
    }
}

function fetchProjects(page) {
    const token = localStorage.getItem('token');

    fetch(`${apiURL_project}/read?page=${page}&limit=${projectsPerPage}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById('tabla-proyectos').querySelector('tbody');
            tableBody.innerHTML = ''; // Limpiar contenido previo

            totalProjects = data.total; // Actualizar total de proyectos
            currentPage = page; // Actualizar página actual

            data.projects.forEach(project => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${project.ProjectName}</td>
                    <td>${project.LandArea}</td>
                    <td>${project.ProjectType}</td>
                    <td>${formatDate(project.StartDate)}</td>
                    <td>${formatDate(project.EndDate)}</td>
                    <td>${project.ClientName} ${project.ClientLastName}</td>
                    <td class="action-icons">
                        <a href="/app_web/html/modificar_datos/modificar_proyecto.html?id=${project.IDProject}" class="modificar">
                            <img src="/app_web/img/boton-editar.png" alt="Editar" class="icon-img">
                        </a>
                        <button class="eliminar" data-id="${project.IDProject}">
                            <img src="/app_web/img/eliminar.png" alt="Eliminar" class="icon-img">
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Asociar eventos de clic a los botones "Eliminar"
            document.querySelectorAll('.eliminar').forEach(button => {
                button.addEventListener('click', () => {
                    const projectId = button.getAttribute('data-id');
                    deleteProject(projectId);
                });
            });

            updatePaginationControls(); // Actualizar los controles de paginación
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar proyectos',
                text: error.message || 'Error desconocido.',
            });
        });
}

function updatePaginationControls() {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Limpiar controles previos

    const totalPages = Math.ceil(totalProjects / projectsPerPage);

    if (totalPages === 0) return; // Si no hay páginas, no mostrar controles

    // Crear botón para página anterior
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.className = 'pagination-btn';
        prevButton.addEventListener('click', () => fetchProjects(currentPage - 1));
        paginationControls.appendChild(prevButton);
    }

    // Crear botones numerados
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'pagination-btn active' : 'pagination-btn';
        button.addEventListener('click', () => fetchProjects(i));
        paginationControls.appendChild(button);
    }

    // Crear botón para página siguiente
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.className = 'pagination-btn';
        nextButton.addEventListener('click', () => fetchProjects(currentPage + 1));
        paginationControls.appendChild(nextButton);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function deleteProject(projectId) {
    const token = localStorage.getItem('token');

    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará el proyecto.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    }).then(result => {
        if (result.isConfirmed) {
            fetch(`${apiURL_project}/delete/${projectId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        Swal.fire('Eliminado', 'El proyecto ha sido eliminado correctamente.', 'success');
                        fetchProjects(currentPage); // Recargar la página actual
                    } else {
                        throw new Error(data.error || 'Error desconocido');
                    }
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Error desconocido.',
                    });
                });
        }
    });
}

// Filtrar proyectos por nombre
document.getElementById('search-project').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const rows = document.querySelectorAll('#tabla-proyectos tbody tr');

    rows.forEach(row => {
        const projectName = row.cells[0].textContent.toLowerCase();
        row.style.display = projectName.includes(searchText) ? '' : 'none';
    });
});
