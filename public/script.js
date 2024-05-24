document.addEventListener('DOMContentLoaded', function () {
    // Función para verificar si el usuario está autenticado
    function checkAuthentication() {
        // Verifica si el usuario está autenticado
        const isAuthenticated = localStorage.getItem('isAuthenticated');

        // Si el usuario está autenticado, redirige al sistema
        if (isAuthenticated === 'true') {
            if (window.location.pathname === '/login.html') {
                window.location.href = 'sistema.html';
            }
        } else {
            // Si no está autenticado y está en el sistema, redirige al login
            if (window.location.pathname === '/sistema.html') {
                window.location.href = 'login.html';
            }
        }
    }

    // Añade un listener al botón de mostrar el formulario de registro
    document.getElementById('showRegisterBtn').addEventListener('click', function () {
        // Muestra el contenedor del formulario de registro estableciendo su estilo display a 'block'
        document.getElementById('registerFormContainer').style.display = 'block';
    });

    // Añade un listener para manejar el envío del formulario de registro
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página)

        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const idEmpleado = document.getElementById('registerId').value;

        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, idEmpleado })
        });

        if (response.ok) {
            alert('User registered');
        } else {
            alert('Failed to register');
        }
    });

    // Añade un listener para manejar el envío del formulario de inicio de sesión
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página)

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            // Establece el estado de autenticación como verdadero
            localStorage.setItem('isAuthenticated', 'true');
            // Agrega una entrada al historial de navegación
            window.history.pushState({}, '', 'sistema.html');
            // Redirige al usuario al sistema
            window.location.href = 'sistema.html';
        } else {
            alert('Failed to log in');
        }
    });

    // Verificar el estado de autenticación al cargar la página
    checkAuthentication();

    // Añadir un listener para el evento popstate (cuando se presiona el botón de retroceso del navegador)
    window.addEventListener('popstate', function (event) {
        // Verificar el estado de autenticación al retroceder en el navegador
        checkAuthentication();
    });

    // Función para cerrar sesión
    function logout() {
        // Eliminar el estado de autenticación
        localStorage.removeItem('isAuthenticated');
        // Redirigir al usuario al inicio de sesión
        window.location.href = 'login.html';
    }

    // Agregar un listener al botón de cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', logout);
});
