import { apiURL_employee } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando paginación...");
    validateToken(() => fetchEmployees(1)); // Iniciar en la página 1
});

// Variables globales para paginación
let employeesPerPage = 5; // Número de empleados por página
let currentPage = 1; // Página actual
let totalEmployees = 0; // Total de empleados

function validateToken(callback) {
    const token = localStorage.getItem('token');

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'No se encontró un token válido. Por favor, inicia sesión nuevamente.',
        }).then(() => {
            window.location.href = '../../../login/index.html';
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
                window.location.href = '../../../login/index.html';
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
            window.location.href = '../../../login/index.html';
        });
    }
}

function fetchEmployees(page) {
    const token = localStorage.getItem('token');

    fetch(`${apiURL_employee}/read?page=${page}&limit=${employeesPerPage}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('tabla-empleados').querySelector('tbody');
            tableBody.innerHTML = ''; // Limpiar contenido previo

            totalEmployees = data.total; // Actualizar total de empleados
            currentPage = page; // Actualizar página actual

            data.employees.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${employee.Name} ${employee.LastName} ${employee.SurName}</td>
                    <td>${employee.Gender}</td>
                    <td>${employee.Phone}</td>
                    <td>${employee.Cellphone}</td>
                    <td>${employee.Email}</td>
                    <td class="action-icons">
                        <a href="../html/modificar_datos/modificar_empleado.html?id=${employee.IDUser}" class="modificar">
                            <img src="../img/boton-editar.png" alt="Editar" class="icon-img">
                        </a>
                        <button class="eliminar" data-id="${employee.IDUser}">
                            <img src="../img/eliminar.png" alt="Eliminar" class="icon-img">
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Asociar eventos de clic a los botones "Eliminar"
            document.querySelectorAll('.eliminar').forEach(button => {
                button.addEventListener('click', () => {
                    const employeeId = button.getAttribute('data-id');
                    deleteEmployee(employeeId);
                });
            });

            updatePaginationControls(); // Actualizar los controles de paginación
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar empleados',
                text: error.message || 'Error desconocido.',
            });
        });
}


function updatePaginationControls() {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Limpiar controles previos

    const totalPages = Math.ceil(totalEmployees / employeesPerPage);

    if (totalPages === 0) return; // Si no hay páginas, no mostrar controles

    // Crear botón para página anterior
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.className = 'pagination-btn';
        prevButton.addEventListener('click', () => fetchEmployees(currentPage - 1));
        paginationControls.appendChild(prevButton);
    }

    // Crear botones numerados
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'pagination-btn active' : 'pagination-btn';
        button.addEventListener('click', () => fetchEmployees(i));
        paginationControls.appendChild(button);
    }

    // Crear botón para página siguiente
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.className = 'pagination-btn';
        nextButton.addEventListener('click', () => fetchEmployees(currentPage + 1));
        paginationControls.appendChild(nextButton);
    }
}

function deleteEmployee(employeeId) {
    console.log(`Intentando eliminar al empleado con ID: ${employeeId}`);
    const token = localStorage.getItem('token');

    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción intentará eliminar al empleado.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    }).then(result => {
        if (result.isConfirmed) {
            fetch(`${apiURL_employee}/delete/${employeeId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.error,
                        });
                    } else {
                        Swal.fire('Eliminado', 'El empleado ha sido eliminado correctamente.', 'success');
                        fetchEmployees(currentPage); // Recargar la lista de empleados
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



document.getElementById('search-project').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const rows = document.querySelectorAll('#tabla-empleados tbody tr');

    rows.forEach(row => {
        const employeeName = row.cells[0].textContent.toLowerCase();
        row.style.display = employeeName.includes(searchText) ? '' : 'none';
    });
});
