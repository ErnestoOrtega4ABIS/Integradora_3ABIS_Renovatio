import { apiURL_client } from '../config.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando paginación de clientes...");
    validateToken(() => fetchClients(1)); // Iniciar con la página 1
});

// Variables globales para paginación
let clientsPerPage = 5; // Número de clientes por página
let currentPage = 1; // Página actual
let totalClients = 0; // Total de clientes

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

        if (!['Admin', 'Employee'].includes(payload.UserType)) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permisos para acceder a esta página.',
            }).then(() => {
                window.location.href = '../../../login/index.html';
            });
            return;
        }

        // Si todo está correcto, ejecutar el callback
        callback();
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'Token inválido o corrupto. Por favor, inicia sesión nuevamente.',
        }).then(() => {
            window.location.href = '../../../login/index.html';
        });
    }
}

function fetchClients(page) {
    const token = localStorage.getItem('token');

    fetch(`${apiURL_client}/read?page=${page}&limit=${clientsPerPage}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })
        .then(response => response.json())
        .then(data => {
            totalClients = data.total; // Total de clientes
            currentPage = page; // Actualizar página actual
            renderClients(data.clients);
            updatePaginationControls();
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar clientes',
                text: error.message || 'Error desconocido.',
            });
        });
}

function renderClients(clients) {
    const tableBody = document.getElementById('tabla-clientes').querySelector('tbody');
    tableBody.innerHTML = ''; // Limpiar contenido previo

    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.ClientName} ${client.LastName} ${client.SurName}</td>
            <td>${client.Gender}</td>
            <td>${client.Phone}</td>
            <td>${client.Cellphone}</td>
            <td>${client.Email}</td>
            <td class="action-icons">
                <a href="../html/modificar_datos/modificar_cliente.html?id=${client.ClientID}" class="modificar">
                    <img src="../img/boton-editar.png" alt="Editar" class="icon-img">
                </a>
                <button onclick="confirmDelete(${client.ClientID})" class="eliminar">
                    <img src="../img/eliminar.png" alt="Eliminar" class="icon-img">
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updatePaginationControls() {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Limpiar controles previos

    const totalPages = Math.ceil(totalClients / clientsPerPage);
    console.log("Total de páginas:", totalPages); // Depura el número de páginas

    // Si no hay más de una página, muestra un indicador
    if (totalPages <= 1) {
        const singlePageIndicator = document.createElement('span');
        singlePageIndicator.textContent = '1';
        singlePageIndicator.className = 'pagination-indicator';
        paginationControls.appendChild(singlePageIndicator);
        return; // No generar más botones
    }

    // Botón "Anterior"
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.className = 'pagination-btn';
        prevButton.addEventListener('click', () => fetchClients(currentPage - 1));
        paginationControls.appendChild(prevButton);
    }

    // Botones de página
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'pagination-btn active' : 'pagination-btn';
        pageButton.addEventListener('click', () => {
            if (i !== currentPage) fetchClients(i);
        });
        paginationControls.appendChild(pageButton);
    }

    // Botón "Siguiente"
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.className = 'pagination-btn';
        nextButton.addEventListener('click', () => fetchClients(currentPage + 1));
        paginationControls.appendChild(nextButton);
    }
}




function confirmDelete(clientId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará el cliente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    }).then(result => {
        if (result.isConfirmed) {
            deleteClient(clientId);
        }
    });
}

function deleteClient(clientId) {
    const token = localStorage.getItem('token');

    fetch(`${apiURL_client}/delete/${clientId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                Swal.fire('Eliminado', 'El cliente ha sido eliminado correctamente.', 'success');
                fetchClients(currentPage); // Recargar la página actual
            } else {
                throw new Error(data.error || 'Error desconocido.');
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

// Búsqueda de clientes
document.getElementById('search-client').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const rows = document.querySelectorAll('#tabla-clientes tbody tr');

    rows.forEach(row => {
        const clientName = row.cells[0].textContent.toLowerCase();
        row.style.display = clientName.includes(searchText) ? '' : 'none';
    });
});

window.confirmDelete = confirmDelete;
