// Espera a que el contenido del DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    
    // Añade un listener al botón de mostrar el formulario de registro
    document.getElementById('showRegisterBtn').addEventListener('click', function () {
        // Muestra el contenedor del formulario de registro estableciendo su estilo display a 'block'
        document.getElementById('registerFormContainer').style.display = 'block';
    });

    // Añade un listener para manejar el envío del formulario de registro
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página)

        // Obtiene los valores de nombre de usuario y contraseña ingresados en el formulario de registro
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const idEmpleado = document.getElementById('registerId').value;
        // Realiza una solicitud POST a la ruta de registro del servidor
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Establece el tipo de contenido a JSON
            },
            body: JSON.stringify({ username, password, idEmpleado }) // Envía el nombre de usuario y la contraseña en el cuerpo de la solicitud
        });

        // Muestra una alerta dependiendo de si la respuesta fue exitosa o no
        if (response.ok) {
            alert('User registered');
        } else {
            alert('Failed to register');
        }
    });
 
    // Añade un listener para manejar el envío del formulario de inicio de sesión
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página)

        // Obtiene los valores de nombre de usuario y contraseña ingresados en el formulario de inicio de sesión
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        // Realiza una solicitud POST a la ruta de inicio de sesión del servidor
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Establece el tipo de contenido a JSON
            },
            body: JSON.stringify({ username, password }) // Envía el nombre de usuario y la contraseña en el cuerpo de la solicitud
        });

        // Muestra una alerta dependiendo de si la respuesta fue exitosa o no
        if (response.ok) {
            window.location.href = 'sistema.html';
        } else {
            alert('Failed to log in');
        }
    });
});
