// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'your_secret_key_here'; // Asegúrate de usar una clave secreta fuerte y almacenarla de forma segura

module.exports = (db) => {
    router.post('/register', (req, res) => {
        const { username, password, idEmpleado } = req.body;
        if (!username || !password || !idEmpleado) {
            return res.status(400).send('Username, password, and IdEmpleado are required');
        }

        const checkEmployeeQuery = 'SELECT COUNT(*) AS count FROM empleados WHERE id = ?';
        db.query(checkEmployeeQuery, [idEmpleado], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }

            const employeeCount = results[0].count;
            if (employeeCount === 0) {
                return res.status(400).send('IdEmpleado does not exist');
            }

            const checkUserQuery = 'SELECT COUNT(*) AS count FROM usuarios WHERE id_empleado = ?';
            db.query(checkUserQuery, [idEmpleado], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).send('Internal server error');
                }

                const userCount = results[0].count;
                if (userCount > 0) {
                    return res.status(400).send('User already exists for this worker');
                }

                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(password, salt);

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

    router.post('/login', (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }

        const query = 'SELECT * FROM usuarios WHERE nombre_usuario = ?';
        db.query(query, [username], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Internal server error');
            }

            if (results.length === 0) {
                return res.status(400).send('User not found');
            }

            const user = results[0];
            if (!user.hash_contraseña) {
                return res.status(400).send('Password is not defined');
            }

            if (!bcrypt.compareSync(password, user.hash_contraseña)) {
                return res.status(400).send('Incorrect password');
            }

            const token = jwt.sign({ id: user.id, username: user.nombre_usuario }, SECRET_KEY, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true });
            res.send('User logged in');
        });
    });

    // Ruta para manejar el logout
    router.post('/logout', (req, res) => {
        res.clearCookie('token');
        res.send('Logged out');
    });

    return router;
};
