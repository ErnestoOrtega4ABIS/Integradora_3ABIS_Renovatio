document.addEventListener("DOMContentLoaded", function () {
    // Método de Contacto Preferido
    const selectContacto = document.getElementById("contacto-preferido");
    const campoDinamico = document.getElementById("campo-dinamico");
    const detalleContacto = document.getElementById("detalle-contacto");

    if (selectContacto) {
        selectContacto.addEventListener("change", function () {
            if (this.value) {
                // Cambiar el placeholder dinámico
                if (this.value === "email") {
                    detalleContacto.placeholder = "Ingrese su correo electrónico";
                } else if (this.value === "telefono") {
                    detalleContacto.placeholder = "Ingrese su número de teléfono";
                } else if (this.value === "celular") {
                    detalleContacto.placeholder = "Ingrese su número de celular";
                }
                campoDinamico.style.display = "flex"; // Mostrar el campo
            } else {
                campoDinamico.style.display = "none"; // Ocultar el campo si no hay selección
            }
        });
    }

    // Presupuesto Aproximado
    const presupuestoInput = document.getElementById("presupuesto");

    if (presupuestoInput) {
        presupuestoInput.addEventListener("input", function () {
            // Eliminar caracteres no numéricos
            let value = this.value.replace(/[^0-9]/g, "");

            // Agregar formato con comas cada 3 dígitos
            value = Number(value).toLocaleString("es-MX");

            // Mostrar el símbolo de pesos
            this.value = value ? `$${value}` : "";
        });

        presupuestoInput.addEventListener("focus", function () {
            // Eliminar el símbolo de pesos al enfocar para edición
            this.value = this.value.replace(/[^0-9]/g, "");
        });

        presupuestoInput.addEventListener("blur", function () {
            // Restaurar el formato al perder el foco
            let value = this.value.replace(/[^0-9]/g, "");
            value = Number(value).toLocaleString("es-MX");
            this.value = value ? `$${value}` : "";
        });
    }
});
