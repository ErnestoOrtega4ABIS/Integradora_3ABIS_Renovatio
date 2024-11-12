document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loadingScreen");
  const appContent = document.getElementById("appContent");

  // Verificar si el entorno es local
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  console.log("isLocal:", isLocal); // Depuración para ver si está detectando correctamente el entorno

  // Función para verificar la conexión solo si no es entorno local
  function checkConnection() {
      console.log("checkConnection called"); // Mensaje para depurar si la función se llama correctamente

      if (isLocal) {
          loadData(); // Cargar directamente en entorno local
      } else {
          if (navigator.onLine) {
              loadData();
          } else {
              loadingScreen.innerHTML = "<p>Error de conexión. Intenta de nuevo.</p><button onclick='checkConnection()'>Reintentar</button>";
          }
      }
  }

  // Función para simular la carga de datos
  function loadData() {
      console.log("loadData called"); // Depuración para verificar que loadData se está llamando
      setTimeout(() => {
          loadingScreen.style.display = "none";
          appContent.style.display = "block";
      }, isLocal ? 500 : 2000); // Reducir el tiempo de espera en modo local
  }

  checkConnection();
});

const checkbox = document.getElementById("btn-menu");
const menu = document.getElementById("menu");

// Función que muestra u oculta el menú
function toggleMenu() {
    if (checkbox.checked) {
        menu.style.transform = "translateX(0)";
    } else {
        menu.style.transform = "translateX(-100%)"; // Usar -100% para ocultar el menú
    }
}

// Agregar el evento 'change' al checkbox
checkbox.addEventListener("change", toggleMenu);
// Agregar el evento 'change' al checkbox
checkbox.addEventListener("change", toggleMenu);

window.addEventListener('resize', () => {
    if (window.innerWidth > 915) {
        checkbox.checked = true; // Activa el checkbox
        menu.style.transform = "translateX(0)"; // Activa el menú en resoluciones más grandes
    } else {
        checkbox.checked = false; // Desactiva el checkbox
        menu.style.transform = "translateX(-100%)"; // Asegura que el menú esté oculto
    }
});

// Verificar el tamaño de la ventana al cargar
if (window.innerWidth > 915) {
    checkbox.checked = true; // Asegura que el checkbox esté activado en pantallas grandes
    menu.style.transform = "translateX(0)"; // Muestra el menú al cargar en pantallas grandes
} else {
    checkbox.checked = false; // Desactiva el menú si la resolución es pequeña
    menu.style.transform = "translateX(-100%)"; // Asegura que el menú esté oculto
}




