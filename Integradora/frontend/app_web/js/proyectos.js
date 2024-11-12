// Archivo: public/js/proyectos.js

// Función para obtener proyectos y mostrarlos
async function fetchProjects() {
    try {
      const response = await fetch('/projects'); // Ruta definida en el backend
      const projects = await response.json();
  
      // Limpia el contenedor de proyectos
      const projectContainer = document.getElementById('projectContainer');
      projectContainer.innerHTML = '';
  
      projects.forEach(project => {
        // Crear elementos HTML para mostrar los datos del proyecto
        const projectElement = document.createElement('div');
        projectElement.className = 'project';
  
        projectElement.innerHTML = `
          <h3>${project.projectName}</h3>
          <p><strong>Área:</strong> ${project.LandArea}</p>
          <p><strong>Cliente:</strong> ${project.clientName}</p>
          <p><strong>Tipo de Proyecto:</strong> ${project.projectType}</p>
          <p><strong>Fecha de Inicio:</strong> ${project.StartDate}</p>
          <p><strong>Fecha de Fin:</strong> ${project.EndDate}</p>
          <p><strong>Status:</strong> ${project.Status}</p>
        `;
  
        projectContainer.appendChild(projectElement);
      });
    } catch (error) {
      console.error("Error al obtener proyectos: ", error);
    }
  }
  
  // Llama a la función para cargar los proyectos cuando la página se carga
  document.addEventListener('DOMContentLoaded', fetchProjects);
  