const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));  // Asegúrate de servir archivos estáticos desde 'public'

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'proyecto',
    port: 3306
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos establecida');
});

// Endpoint para obtener empleados y sus detalles
app.get('/empleados', (req, res) => {
    const query = `
        SELECT 
            e.id AS id_empleado,
            e.nombres,
            e.apellidos,
            e.fecha_nacimiento,
            e.fecha_ingreso,
            e.direccion,
            e.genero,
            e.dpi,
            e.telefono,
            e.correo_electronico,
            d.nombre_departamento,
            c.nombre_cargo,
            n.periodo_inicio,
            n.periodo_fin,
            n.salario_base,
            n.bonificaciones,
            n.deducciones,
            n.salario_neto
        FROM 
            proyecto.empleados e
        JOIN 
            proyecto.nominas n ON e.id = n.id_empleado
        LEFT JOIN 
            proyecto.departamentos d ON e.id_departamento = d.id
        LEFT JOIN 
            proyecto.cargos c ON e.id_cargo = c.id;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).send('Error obteniendo los datos');
            return;
        }
        res.json(results);
    });
});

// Endpoint para obtener departamentos
app.get('/departamentos', (req, res) => {
    const query = 'SELECT nombre_departamento FROM proyecto.departamentos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            res.status(500).send('Error obteniendo los datos');
            return;
        }
        res.json(results.map(row => row.nombre_departamento));
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
