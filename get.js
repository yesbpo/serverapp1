const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
require('dotenv').config();
const socketIo = require('socket.io');
const app = express();
const port = 8080;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Reemplaza con tu dominio
    methods: ["GET", "POST"]
  }
});

const apiUrl = 'https://api.gupshup.io/sm/api/v1/template/list/Pb1yes';
const apiUrlenvio = 'https://api.gupshup.io/sm/api/v1/msg'
const apiKey = '6ovjpik6ouhlyoalchzu4r2csmeqwlbg';
const apiUrluser = 'https://api.gupshup.io/sm/api/v1/users/Pb1yes'
app.use(cors({ origin: '*' }));
// conexion crud base de datos
app.options('/crear-datos', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).send();
});

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permitir todos los orígenes (No recomendado en producción)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

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
// crear sesion
app.post('/crear-sesion', async (req, res) => {
  try {
    const { usuario, status_sesison, fecha_ingreso, fecha_salida  } = req.body;

    // Ejecutar la consulta SQL para insertar un nuevo usuario
    const [result] = await promisePool.execute(
      'INSERT INTO sesion (usuario, status_sesison, fecha_ingreso, fecha_salida) VALUES (?, ?, ?, ?, ?, ?)',
      [usuario, status_sesison, fecha_ingreso, fecha_salida]
    );

    const nuevaSesion = {
      id: result.insertId,
      usuario, status_sesison, fecha_ingreso, fecha_salida
    };

    res.json({ mensaje: 'Sesion crada', usuario: nuevaSesion });
  } catch (error) {
    console.error('Error al crear sesion en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// obtener usuarios
app.get('/obtener-usuarios', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM usuarios');
    res.json({ usuarios: rows });
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Configuración del middleware CORS en Express
// envio mensajes
app.post('/api/envios', bodyParser.urlencoded({ extended: true }), async (req, res) => {
  try {
    const url = apiUrlenvio;
    // Obtenemos la data proporcionada por el cliente
    const clientData = req.body;
    // Construimos la solicitud a la API de Gupshup
    const formData = new URLSearchParams();
    Object.entries(clientData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': apiKey,
    };

    // Hacemos la solicitud a la API de Gupshup
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    // Manejamos la respuesta del servidor Gupshup
    if (response.ok) {
      const responseData = await response.json();
      console.log('Respuesta del servidor Gupshup:', responseData);

      // Enviamos la respuesta al cliente
      res.json(responseData);
    } else {
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Ruta para realizar la solicitud y devolver la respuesta al cliente de los templates
app.get('/api/templates', async (req, res) => {
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response:', data.templates);

    res.json(data.templates); // Devolver la respuesta al cliente
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//solicitud de usuarios
app.get('/api/users', async (req, res) => {
  try {
    const response = await fetch(apiUrluser, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response:', data);

    res.json(data); // Devolver la respuesta al cliente
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//generar partner token
const apiUrlPartnertoken = 'https://partner.gupshup.io/partner/account/login';

// Ruta para manejar la petición POST
app.post('/partner/account/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await fetch(apiUrlPartnertoken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Respuesta exitosa:', data);

    // Aquí puedes realizar acciones con los datos, como autenticación y obtención del token

    // Por ahora, simplemente respondemos con los datos recibidos
    res.json({ email, password });
  } catch (error) {
    // Manejar errores aquí
    console.error('Error al realizar la solicitud:', error);
    res.status(500).json({ error: 'Error al realizar la solicitud' });
  }
});


// Middleware para parsear el cuerpo de la solicitud como JSON
app.use(express.json());
// Ejemplo de configuración en Express
app.use((req, res, next) => {
  // Configuración de CORS en tu servidor WebSocket
res.header('Access-Control-Allow-Origin', '*');

  res.header('Access-Control-Allow-Methods', 'ALL');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Ruta para recibir solicitudes
const tata = app.all('/api/index', async (req, res) => {
  const userAgent = req.get('User-Agent');

  // Verifica si la solicitud es del User-Agent específico
  if (userAgent) {
    try {
      // Procesa la solicitud de manera asíncrona aquí
     var data = req.body;
      await processAsync(data);

      // Emitir el evento a través de Socket.IO para notificar cambios en tiempo real
      io.emit('cambio', data);
      console.log(data)
      // Acknowledge la recepción de manera síncrona e inmediata
      res.status(200).end();
      return data
    } catch (error) {
      // Maneja cualquier error durante el procesamiento asíncrono
      console.error('Error durante el procesamiento asíncrono:', error);
      res.status(500).send('Error interno del servidor.');
    }
    
  } else {
    // La solicitud no proviene de Gupshup, responde con un error
    res.status(403).send('Acceso no autorizado.');
  }
  console.log("paso" + data)
  return data
}
);

// Función asíncrona para procesar la solicitud
async function processAsync(datas) {
  // Implementa lógica de procesamiento asíncrono aquí
  // Puedes realizar operaciones de larga duración, como llamadas a bases de datos, envío de correos electrónicos, etc.
}

// Configuración de Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Manejar la desconexión del cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor y Socket.IO escuchando en http://localhost:${tata.data}`);
});
