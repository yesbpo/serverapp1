// sdsdghfehefdhsdgfhgesdhdgjdgjdgjdg
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = 8080;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Reemplaza con tu dominio
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta '/api/index'
app.all('/w/api/index', async (req, res) => {
  try {
    // Verifica si la solicitud es del User-Agent específico
    const userAgent = req.get('User-Agent');
    if (userAgent) {
      const data = req.body;
      console.log(data);
      // Procesa la solicitud de manera asíncrona aquí
      await processAsync(data);
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

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
  console.log(`Servidor y Socket.IO escuchando en el puerto ${port}`);
});

// Función asíncrona para procesar datos
async function processAsync(data) {
  // Implementa tu lógica aquí
  console.log('Procesando datos:', data);
}
