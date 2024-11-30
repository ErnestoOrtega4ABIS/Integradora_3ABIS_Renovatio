document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.wrapper');
    const loginForm = document.querySelector('.form-wrapper.login form');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector('input[type="text"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        try {
            const response = await fetch('https://renovatiogc.up.railway.app/api/auth/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Permitir credenciales entre dominios
            });
            

            if (response.ok) {
                const data = await response.json();
                const token = data.token; // Token recibido del backend

                // Guardar el token en localStorage
                localStorage.setItem('token', token);

                // Alerta de éxito y redirección
                Swal.fire({
                    icon: "success",
                    title: "Inicio de sesión exitoso",
                    showConfirmButton: false,
                    timer: 1500
                });

                // Redirigir según el rol del usuario (decodificar token para obtener el UserType)
                const payload = JSON.parse(atob(token.split('.')[1]));
                setTimeout(() => {
                    if (payload.UserType === 'Admin') {
                        window.location.href = '/app_web/home.html';
                    } else if (payload.UserType === 'Employee') {
                        window.location.href = '/app_web/home.html';
                    }
                }, 1500);
            } else if (response.status === 401) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Usuario o contraseña incorrectos",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Error en el servidor",
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error de conexión",
            });
        }
    });
});
