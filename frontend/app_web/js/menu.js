const checkbox = document.getElementById("btn-menu");
const menu = document.getElementById("menu");
const adminCuentaBtn = document.getElementById("admin-cuenta-btn");
const accountMenu = document.getElementById("account-menu");

// Función que muestra u oculta el menú principal
function toggleMenu() {
    if (checkbox.checked) {
        menu.style.transform = "translateX(0)";
    } else {
        menu.style.transform = "translateX(-100%)";
    }
}

checkbox.addEventListener("change", toggleMenu);

window.addEventListener("resize", () => {
    if (window.innerWidth > 915) {
        checkbox.checked = true;
        menu.style.transform = "translateX(0)";
    } else {
        checkbox.checked = false;
        menu.style.transform = "translateX(-100%)";
    }
});

// Verificar el tamaño de la ventana al cargar
if (window.innerWidth > 915) {
    checkbox.checked = true;
    menu.style.transform = "translateX(0)";
} else {
    checkbox.checked = false;
    menu.style.transform = "translateX(-100%)";
}

// Función para alternar la visibilidad de los submenús del menú principal
function toggleSubmenu(menuId) {
    const currentSubmenu = document.getElementById(`submenu-${menuId}`);

    // Cerrar otros submenús
    const allSubmenus = document.querySelectorAll(".submenu");
    allSubmenus.forEach((submenu) => {
        if (submenu !== currentSubmenu) {
            submenu.classList.remove("visible");
        }
    });

    // Alternar visibilidad del submenú actual
    currentSubmenu.classList.toggle("visible");
}

// Función para alternar el menú de "Administrar Cuenta"
function toggleAccountMenu() {
    accountMenu.classList.toggle("visible");
}

// Event listener para el botón de "Administrar Cuenta"
if (adminCuentaBtn) {
    adminCuentaBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Evita cerrar el menú por el evento global de clic
        toggleAccountMenu();
    });
}

// Cerrar el menú de "Administrar Cuenta" si se hace clic fuera
document.addEventListener("click", (event) => {
    if (
        accountMenu.classList.contains("visible") &&
        !event.target.closest("#admin-cuenta-btn") &&
        !event.target.closest("#account-menu")
    ) {
        accountMenu.classList.remove("visible");
    }
});

// Función para establecer el enlace activo
function setActiveLink() {
    const path = window.location.pathname;
    const links = document.querySelectorAll(".menu ul li a");

    links.forEach((link) => {
        if (path.includes(link.getAttribute("href"))) {
            link.classList.add("activo");
            const submenu = link.closest(".submenu");
            if (submenu) submenu.classList.add("visible");
        } else {
            link.classList.remove("activo");
        }
    });
}

setActiveLink();
