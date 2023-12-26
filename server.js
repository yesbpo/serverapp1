const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
require('dotenv').config();
app.use(express.json());
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

//crearsession
app.put('/actualizar/usuario', async (req, res) => {
  try {
    const {nuevoDato, usuario  } = req.body;
    // Realiza la actualización en la base de datos
    if (usuario !== undefined && nuevoDato !== undefined) {
      // Realiza la actualización en la base de datos
      const [result] = await promisePool.execute(
        'UPDATE User SET session = ? WHERE usuario = ?',
        [nuevoDato, usuario]
      );  
    // Verifica si se realizó la actualización correctamente
    if (result.affectedRows > 0) {
      console.log('Usuario actualizado correctamente.');
      res.status(200).json({ mensaje: 'Usuario actualizado correctamente.' });
    } else {
      console.log('No se encontró el usuario para actualizar.');
      res.status(404).json({ error: 'Usuario no encontrado.' });
    }}
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Ruta para insertar datos
app.post('/crear-usuario', async (req, res) => {
  try {
    const {type_user, createdAt, updatedAt, email, session, usuario, password, complete_name } = req.body;

    // Ejecutar la consulta SQL para insertar un nuevo usuario
    const [result] = await promisePool.execute(
      'INSERT INTO User (usuario, password, email, createdAt, updatedAt, session, type_user, complete_name) VALUES (?, ?, ?, NOW(), NOW(), ?, ?, ?)',
      [type_user, email, , session, usuario, password, complete_name]
    );

    const nuevoUsuario = {
      id: result.insertId,
      type_user, createdAt, updatedAt, email, session, usuario, password, complete_name    };

    res.json({ mensaje: 'Usuario creado con éxito', usuario: nuevoUsuario });
  } catch (error) {
    console.error('Error al crear el usuario en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// ruta de crear mensajes

app.use('/guardar-mensajes', cors());
app.get('/obtener-mensajes-fecha', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // Ejecutar la consulta SQL para obtener mensajes filtrados por rango de fechas
    const query = {
      text: 'SELECT * FROM mensajes WHERE timestamp >= $1 AND timestamp <= $2',
      values: [fechaInicio, fechaFin],
    };
    
    const { rows } = await promisePool.query(query);

    // Enviar los mensajes obtenidos como respuesta
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener los mensajes de la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
app.post('/guardar-mensajes', async (req, res) => {
  try {
    const { content, type_comunication, status, number, timestamp, type_message, idMessage } = req.body;

    // Verificar si ya existe un mensaje con el mismo idMessage
    const [existingResult] = await promisePool.execute(
      'SELECT * FROM mensajes WHERE idMessage = ?',
      [idMessage]
    );

    if (existingResult.length > 0) {
      // Si ya existe, actualiza los demás datos
      const [updateResult] = await promisePool.execute(
        'UPDATE mensajes SET content = ?, type_comunication = ?, status = ?, number = ?, timestamp = ?, type_message = ? WHERE idMessage = ?',
        [content, type_comunication, status, number, timestamp, type_message, idMessage]
      );

      if (updateResult.affectedRows > 0) {
        console.log('Mensaje actualizado correctamente.');
        res.json({ mensaje: 'Mensaje actualizado con éxito', usuario: { idMessage, content, type_comunication, status, number, timestamp, type_message } });
      } else {
        console.log('No se encontró el mensaje para actualizar.');
        res.status(404).json({ error: 'Mensaje no encontrado para actualizar.' });
      }
    } else {
      // Si no existe, inserta un nuevo mensaje
      const [insertResult] = await promisePool.execute(
        'INSERT INTO mensajes (content, type_comunication, status, number, timestamp, type_message, idMessage) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [content, type_comunication, status, number, timestamp, type_message, idMessage]
      );

      const nuevoMensaje = {
        id: insertResult.insertId,
        content, type_comunication, status, number, timestamp, type_message, idMessage
      };

      res.json({ mensaje: 'Mensaje guardado con éxito', usuario: nuevoMensaje });
    }
  } catch (error) {
    console.error('Error al guardar o actualizar el mensaje en la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
//obtener mensajes

app.get('/obtener-mensajes', async (req, res) => {
  try {
    // Ejecutar la consulta SQL para obtener todos los mensajes
    const [rows] = await promisePool.query('SELECT * FROM Mensaje');

    // Enviar los mensajes obtenidos como respuesta
    res.json( rows );
  } catch (error) {
    console.error('Error al obtener los mensajes de la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// crear chats 
app.post('/crear-chat', async (req, res) => {
  try {
    const chatsData = req.body;

    // Si chatsData no es una matriz, conviértelo en una matriz para manejar un solo objeto
    const chatsArray = Array.isArray(chatsData) ? chatsData : [chatsData];

    for (const chat of chatsArray) {
      const { id, resolved, status, userId, idChat2 } = chat;

      // Verificar si ya existe un chat con el mismo idChat2
      const [existingResult] = await promisePool.execute(
        'SELECT * FROM Chat WHERE idChat2 = ?',
        [idChat2]
      );

      if (existingResult.length > 0) {
        // Si ya existe, actualiza los demás datos
        await promisePool.execute(
          'UPDATE Chat SET resolved = ?, status = ?, userId = ? WHERE idChat2 = ?',
          [ resolved, status, userId, idChat2]
        );
      } else {
        // Si no existe, inserta un nuevo chat
        await promisePool.execute(
          'INSERT INTO Chat (receivedDate, assignedDate, attendedDate, closedDate, resolved, status, userId, idChat2) VALUES ( NOW(), null, null, null, ?, ?, ?, ?)',
          [ resolved, status, userId, idChat2]
        );
      }
    }

    res.json({ mensaje: 'Chats creados o actualizados con éxito' });
  } catch (error) {
    console.error('Error al crear o actualizar el chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// Ruta para actualizar el userId de un chat por idChat2
app.put('/actualizar-usuario-chat', async (req, res) => {
  try {
    const idChat2 = req.body.idChat2; // Se espera que el idChat2 sea proporcionado en el cuerpo de la solicitud
    const nuevoUserId = req.body.nuevoUserId; // Nuevo valor de userId que se proporcionará en el cuerpo de la solicitud

    // Realiza la consulta SQL para actualizar el userId del chat por idChat2
    const [result] = await promisePool.execute('UPDATE Chat SET userId = ?, assignedDate = NOW() WHERE idChat2 = ?', [nuevoUserId, idChat2]);

    if (result.affectedRows > 0) {
      // Si se actualiza con éxito, devolver una respuesta exitosa
      res.json({ success: true, message: 'Usuario del chat actualizado correctamente' });
    } else {
      // Si no se encuentra el chat, devolver un mensaje de error
      res.status(404).json({ error: 'Chat no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar el usuario del chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// actualizar estado del chat 
app.put('/actualizar-estado-chat', async (req, res) => {
  try {
    const idChat2 = req.body.idChat2; // Se espera que el idChat2 sea proporcionado en el cuerpo de la solicitud
    const nuevoEstado = req.body.nuevoEstado; // Nuevo valor de userId que se proporcionará en el cuerpo de la solicitud

    // Realiza la consulta SQL para actualizar el userId del chat por idChat2
    const [result] = await promisePool.execute('UPDATE Chat SET status = ? WHERE idChat2 = ?', [nuevoEstado, idChat2]);

    if (result.affectedRows > 0) {
      // Si se actualiza con éxito, devolver una respuesta exitosa
      res.json({ success: true, message: 'Usuario del chat actualizado correctamente' });
    } else {
      // Si no se encuentra el chat, devolver un mensaje de error
      res.status(404).json({ error: 'Chat no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar el usuario del chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// buscar chat por id 
// Supongamos que 'pool' es tu conexión a la base de datos

app.get('/obtener-chat-id', async (req, res) => {
  try {
    const idChat2 = req.query.idChat2;

    // Realiza la consulta SQL para obtener el chat por ID
    const [chats] = await promisePool.execute('SELECT * FROM Chat WHERE idChat2 = ?', [idChat2]);

    if (chats.length > 0) {
      // Si se encuentra el chat, devolverlo como JSON
      res.json(chats);
    } else {
      // Si no se encuentra el chat, devolver un mensaje de error
      res.status(404).json({ error: 'Chat no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el chat por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// Ruta para obtener todos los chats
app.get('/obtener-chats', async (req, res) => {
  try {
    // Obtener todos los chats de la base de datos
    const [rows] = await promisePool.execute('SELECT * FROM Chat');

    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows);
    } else {
      res.json({ mensaje: 'No hay chats disponibles en la base de datos' });
    }
  } catch (error) {
    console.error('Error al obtener los chats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// actualizar mensajes 
app.put('/mensajeenviado', async (req, res) => {
  try {
    const {content, idMessage} = req.body;
    // Realiza la actualización en la base de datos
    if (idMessage !== undefined && content !== undefined) {
      // Realiza la actualización en la base de datos
      const [result] = await promisePool.execute(
        'UPDATE mensajes SET content = ? WHERE idMessage = ?',
        [content, idMessage]
      );  
    // Verifica si se realizó la actualización correctamente
    if (result.affectedRows > 0) {
      console.log('mensaje actualizado correctamente.');
      res.status(200).json({ mensaje: 'mensaje actualizado correctamente.' });
    } else {
      console.log('No se encontró el mensaje para actualizar.');
      res.status(404).json({ error: 'mensaje no encontrado.' });
    }}
  } catch (error) {
    console.error('Error al actualizar el mensaje:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});
// actualizar uusario 
app.put('/actualizar/usuario', async (req, res) => {
  try {
    const {nuevoDato, usuario } = req.body;
    // Realiza la actualización en la base de datos
    if (usuario !== undefined && nuevoDato !== undefined) {
      // Realiza la actualización en la base de datos
      const [result] = await promisePool.execute(
        'UPDATE User SET session = ? WHERE usuario = ?',
        [nuevoDato, usuario]
      );  
    // Verifica si se realizó la actualización correctamente
    if (result.affectedRows > 0) {
      console.log('Usuario actualizado correctamente.');
      res.status(200).json({ mensaje: 'Usuario actualizado correctamente.' });
    } else {
      console.log('No se encontró el usuario para actualizar.');
      res.status(404).json({ error: 'Usuario no encontrado.' });
    }}
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// actualizar estado del mensaje
app.put('/mensajestatus', async (req, res) => {
  try {
    const {status, idMessage} = req.body;
    // Realiza la actualización en la base de datos
    if (idMessage !== undefined && status !== undefined) {
      // Realiza la actualización en la base de datos
      const [result] = await promisePool.execute(
        'UPDATE mensajes SET status = ? WHERE idMessage = ?',
        [status, idMessage]
      );  
    // Verifica si se realizó la actualización correctamente
    if (result.affectedRows > 0) {
      console.log('mensaje actualizado correctamente.');
      res.status(200).json({ mensaje: 'mensaje actualizado correctamente.' });
    } else {
      console.log('No se encontró el mensaje para actualizar.');
      res.status(404).json({ error: 'mensaje no encontrado.' });
    }}
  } catch (error) {
    console.error('Error al actualizar el mensaje:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

//obtener usuaios
app.get('/obtener-usuarios', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM User');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor Express en ejecución en el puerto ${PORT}`);
});
//por id
app.get('/usuarios/:id', (req, res) => {
  const userId = req.params.id;

  // Consultar el usuario en la base de datos
  connection.query('SELECT * FROM User WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      res.status(500).send('Error interno del servidor');
    } else {
      if (results.length > 0) {
        const usuario = results[0];
        res.json(usuario);
      } else {
        res.status(404).send('Usuario no encontrado');
      }
    }
  });
});
