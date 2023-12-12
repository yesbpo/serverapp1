const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
require('dotenv').config();

//app.use(cors({
 // origin: 'http://localhost:5173',
  //methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //credentials: true,
//}));
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.options('/crear-datos', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).send();
});

app.use(bodyParser.json());

const dbConfig = {
  host: process.env.DBHOST,
  port: process.env.DBPORT,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME
};

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// Función para insertar datos en la base de datos
function insertarDatosEnBD(datos, callback) {
  const { nombre, email, password } = datos;
  const consultaSQL = 'INSERT INTO usuario (nombre, email, password) VALUES (?, ?, ?)';

  promisePool.query(consultaSQL, [nombre, email, password])
    .then(([resultado]) => {
      callback(null, resultado);
    })
    .catch((err) => {
      callback(err, null);
    });
}

// Ruta para insertar datos
app.post('/crear-usuario', async (req, res) => {
  try {
    const { Nombre, Apellido, Email, Usuario, Password, TypeUser } = req.body;

    // Ejecutar la consulta SQL para insertar un nuevo usuario
    const [result] = await promisePool.execute(
      'INSERT INTO usuarios (Nombre, Apellido, Email, Usuario, Password, TypeUser) VALUES (?, ?, ?, ?, ?, ?)',
      [Nombre, Apellido, Email, Usuario, Password, TypeUser]
    );

    const nuevoUsuario = {
      id: result.insertId,
      Nombre,
      Apellido,
      Email,
      Usuario,
      Password,
      TypeUser,
    };

    res.json({ mensaje: 'Usuario creado con éxito', usuario: nuevoUsuario });
  } catch (error) {
    console.error('Error al crear el usuario en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/obtener-usuarios', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM usuarios');
    res.json({ usuarios: rows });
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor Express en ejecución en el puerto ${PORT}`);
});
