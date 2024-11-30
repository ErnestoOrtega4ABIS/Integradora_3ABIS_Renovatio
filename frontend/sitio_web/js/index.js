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
  
  document.addEventListener("scroll", () => {
    const body = document.body;
    const scrollPosition = window.scrollY;
    
    if (scrollPosition > 50) {
        body.classList.add("scrolled");
    } else {
        body.classList.remove("scrolled");
    }
});