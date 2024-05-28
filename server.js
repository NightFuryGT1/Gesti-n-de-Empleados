// Importa las dependencias necesarias
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middlewares/authenticateToken');

// Configura el middleware para parsear JSON y datos URL codificados
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Configura la conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gestionempleados'
});

// Conecta a la base de datos MySQL y maneja errores de conexión
db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});

// Usa las rutas de autenticación, pasando la conexión de base de datos
app.use('/auth', authRoutes(db));

// Ruta para obtener los datos de los empleados
app.get('/api/empleados', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM empleados';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results);
    });
});

// Ruta para obtener los datos de los usuarios
app.get('/api/usuarios', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM usuarios';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results);
    });
});
// server.js

// Ruta para buscar empleados por nombre
app.get('/api/empleados/buscar', authenticateToken, (req, res) => {
    const { nombre } = req.query;
    const query = 'SELECT * FROM empleados WHERE nombres LIKE ?';
    db.query(query, [`%${nombre}%`], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }
        res.json(results);
    });
});


// Ejemplo de ruta protegida
app.get('/protected', authenticateToken, (req, res) => {
    res.send('This is a protected route');
});

// Verificar si hay una cookie de token válida al cargar cualquier página protegida
app.use((req, res, next) => {
    if (req.path !== '/login.html' && req.path !== '/' && req.path !== '/auth/login') {
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/login.html');
        }

        jwt.verify(token, 'your_secret_key_here', (err, user) => {
            if (err) {
                return res.redirect('/login.html');
            }
            next();
        });
    } else {
        next();
    }
});

// Define el puerto en el que el servidor escuchará las solicitudes
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
