// script_carousel.js
let index = 0;

function cambiarImagen(n) {
    const images = document.querySelectorAll('.carrusel-image');
    index += n;

    if (index >= images.length) {
        index = 0;
    } else if (index < 0) {
        index = images.length - 1;
    }

    // Mover el carrusel
    const carruselImages = document.querySelector('.carrusel-images');
    carruselImages.style.transform = `translateX(${-index * 100}%)`;
}