// Importa las dependencias necesarias
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const app = express();
const authRoutes = require('./routes/auth');

// Configura el middleware para parsear JSON y datos URL codificados
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

// Define el puerto en el que el servidor escuchará las solicitudes
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
