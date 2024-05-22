// Importa las dependencias necesarias
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Exporta una función que toma la conexión a la base de datos como argumento
module.exports = (db) => {

    // Define la ruta para el registro de usuarios
    router.post('/register', (req, res) => {
        const { username, password, idEmpleado } = req.body;

        // Verifica si el nombre de usuario, contraseña y ID de empleado fueron proporcionados
        if (!username || !password || !idEmpleado) {
            return res.status(400).send('Username, password, and IdEmpleado are required');
        }

        // Verifica si el ID de empleado existe en la tabla de empleados
        const checkEmployeeQuery = 'SELECT COUNT(*) AS count FROM empleados WHERE id = ?';
        db.query(checkEmployeeQuery, [idEmpleado], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }

            const employeeCount = results[0].count;

            // Si el ID de empleado no existe, retorna un error
            if (employeeCount === 0) {
                return res.status(400).send('IdEmpleado does not exist');
            }

            // Consulta para verificar si ya existe un usuario asociado al ID de empleado
            const checkUserQuery = 'SELECT COUNT(*) AS count FROM usuarios WHERE id_empleado = ?';
            db.query(checkUserQuery, [idEmpleado], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).send('Internal server error');
                }

                const userCount = results[0].count;

                // Si ya hay un usuario asociado al ID de empleado, retorna un error
                if (userCount > 0) {
                    return res.status(400).send('User already exists for this worker');
                }

                // Genera un salt y hashea la contraseña proporcionada
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(password, salt);

                // Inserta el nuevo usuario en la base de datos con la contraseña hasheada
                const insertQuery = 'INSERT INTO usuarios (nombre_usuario, hash_contraseña, id_empleado) VALUES (?, ?, ?)';
                db.query(insertQuery, [username, hashedPassword, idEmpleado], (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).send('Internal server error');
                    }
                    res.status(201).send('User registered');
                });
            });
        });
    });

    // Define la ruta para el inicio de sesión de usuarios
    router.post('/login', (req, res) => {
        const { username, password } = req.body;

        // Verifica si el nombre de usuario y la contraseña fueron proporcionados
        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }

        // Consulta para obtener el usuario con el nombre de usuario proporcionado
        const query = 'SELECT * FROM usuarios WHERE nombre_usuario = ?';
        db.query(query, [username], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }

            // Si no se encuentra el usuario, retorna un error
            if (results.length === 0) {
                return res.status(400).send('User not found');
            }

            const user = results[0];

            // Verifica si la contraseña almacenada en la base de datos es válida antes de compararla
            if (!user.hash_contraseña) {
                return res.status(400).send('Password is not defined');
            }

            // Compara la contraseña proporcionada con la almacenada en la base de datos
            if (!bcrypt.compareSync(password, user.hash_contraseña)) {
                return res.status(400).send('Incorrect password');
            }

            res.send('User logged in');
        });
    });

    return router; // Retorna el router configurado con las rutas de autenticación
};
