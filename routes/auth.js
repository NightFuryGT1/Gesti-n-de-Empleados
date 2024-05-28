// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'your_secret_key_here'; // Asegúrate de usar una clave secreta fuerte y almacenarla de forma segura

module.exports = (db) => {
    // Ruta para registrar un nuevo usuario
    router.post('/register', (req, res) => {
        const { username, password, idEmpleado } = req.body;
        // Verificación de que los campos necesarios están presentes en la solicitud
        if (!username || !password || !idEmpleado) {
            return res.status(400).send('Username, password, and IdEmpleado are required');
        }

        // Consulta para verificar que el empleado existe en la base de datos
        const checkEmployeeQuery = 'SELECT COUNT(*) AS count FROM empleados WHERE id = ?';
        db.query(checkEmployeeQuery, [idEmpleado], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }

            const employeeCount = results[0].count;
            // Si el empleado no existe, devolver un error
            if (employeeCount === 0) {
                return res.status(400).send('IdEmpleado does not exist');
            }

            // Consulta para verificar que el usuario no exista ya para este empleado
            const checkUserQuery = 'SELECT COUNT(*) AS count FROM usuarios WHERE id_empleado = ?';
            db.query(checkUserQuery, [idEmpleado], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).send('Internal server error');
                }

                const userCount = results[0].count;
                // Si el usuario ya existe, devolver un error
                if (userCount > 0) {
                    return res.status(400).send('User already exists for this worker');
                }

                // Generar un hash de la contraseña antes de almacenarla
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(password, salt);

                // Insertar el nuevo usuario en la base de datos
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

    // Ruta para iniciar sesión
    router.post('/login', (req, res) => {
        const { username, password } = req.body;
        // Verificación de que los campos necesarios están presentes en la solicitud
        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }

        // Consulta para obtener el usuario por nombre de usuario
        const query = 'SELECT * FROM usuarios WHERE nombre_usuario = ?';
        db.query(query, [username], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }

            // Si el usuario no se encuentra, devolver un error
            if (results.length === 0) {
                return res.status(400).send('User not found');
            }

            const user = results[0];
            // Verificación de que el usuario tenga una contraseña definida
            if (!user.hash_contraseña) {
                return res.status(400).send('Password is not defined');
            }

            // Comparar la contraseña proporcionada con el hash almacenado
            if (!bcrypt.compareSync(password, user.hash_contraseña)) {
                return res.status(400).send('Incorrect password');
            }

            // Crear un token JWT para el usuario autenticado
            const token = jwt.sign({ id: user.id, username: user.nombre_usuario }, SECRET_KEY, { expiresIn: '1h' });
            // Enviar el token al cliente en una cookie HTTP-only
            res.cookie('token', token, { httpOnly: true });
            res.send('User logged in');
        });
    });

    // Ruta para manejar el logout
    router.post('/logout', (req, res) => {
        // Borrar la cookie que contiene el token JWT
        res.clearCookie('token');
        res.send('Logged out');
    });

    return router;
};
