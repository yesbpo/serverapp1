const express = require('express');
const axios = require('axios');
const mysql = require('mysql2');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
require('dotenv').config();
const socketIo = require('socket.io');
const app = express();
const port = 8080;
const multer = require('multer');
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Reemplaza con tu dominio
    methods: ["GET", "POST"]
  }
});
const apiUrl = 'https://api.gupshup.io/sm/api/v1/template/list/Pb1yes';
const apiUrlenvio = 'https://api.gupshup.io/sm/api/v1/msg';
const apiKey = '6ovjpik6ouhlyoalchzu4r2csmeqwlbg';
const apiUrluser = 'https://api.gupshup.io/sm/api/v1/users/Pb1yes';
const apiUrlPartnertoken = 'https://partner.gupshup.io/partner/account/login';
app.use(cors({ origin: '*' }));
// conexion crud base de datos
app.options('/w/crear-datos', (req, res) => {
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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });


// Ruta para recibir eventos del webhook
app.all('/w/api/index', async (req, res) => {
  const userAgent = req.get('User-Agent');
  // Verifica si la solicitud es del User-Agent específico
  if (userAgent) {
    try {
      // Procesa la solicitud de manera asíncrona aquí
      await processAsync(data);
      var data = req.body;
      console.log(data)
        
       //condicional para determinar si el idMessage ya existe
        
       fetch('https://appcenteryes.appcenteryes.com/db/guardar-mensajes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({  // Acceder a los valores de source, destination y content
    number : data.payload.source || data.payload.destination ,
    content : data.payload.payload.text || data.payload.payload.url,
    type_comunication :data.type,
    status : data.payload.type   || 'null',
    timestamp : new Date().toISOString().slice(0, 19).replace('T', ' '),
    type_message : data.payload.type ,
    idMessage : data.payload.id}
  ),
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log('Respuesta del servidor:', data);
    // Manejar la respuesta según tus necesidades
  })
  .catch((error) => {
    console.error('Error al consumir la ruta:', error);
    // Manejar el error según tus necesidades
  });
     } catch (error) {
      // Maneja cualquier error durante el procesamiento asíncrono
      console.error('Error durante el procesamiento asíncrono:', error);
      res.status(500).send('Error interno del servidor.');
    }
    } else {
     //La solicitud no proviene de Gupshup, responde con un error
    res.status(403).send('Acceso no autorizado.');
    }
     //obtener mensajes
     try {
      const response = await fetch('https://appcenteryes.appcenteryes.com/db/obtener-mensajes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Agrega cualquier otra cabecera que sea necesaria, como token de autorización, si es aplicable
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
  
      const mensajes = await response.json();
      console.log('mensajes obtenidos:', mensajes);
      // Filtra solo los usuarios activos
      const numerosUnicos = [...new Set(mensajes.map((mensaje) => mensaje.number))];
      console.log(numerosUnicos)
      async function normalizarNumero(numero) {
        // Eliminar caracteres no numéricos
        const numeroLimpio = numero.replace(/\D/g, '');
      
        // Si el número tiene 10 dígitos, agregar el prefijo '57'
        const numeroNormalizado = numeroLimpio.length === 10 ? '57' + numeroLimpio : numeroLimpio;
      
        return numeroNormalizado;
      }
      //crear chats
      
      try {
        const response = await fetch('https://appcenteryes.appcenteryes.com/db/obtener-chats');
        const chats = response.json()
        
      let inc = 20; // Inicializa un contador
      for (const numeroUnico of numerosUnicos) {
        const numeroNormalizado = await normalizarNumero(numeroUnico);
        const chatExistente = await verificarChatExistente(numeroNormalizado);
        if(!chatExistente){
        const data = {
          id: inc++, // Asigna el valor actual del contador y luego incrementa
          idChat2:numeroNormalizado ,
          resolved: false,
          status: 'pending',
          userId: 0,
        };
        const response = await fetch('https://appcenteryes.appcenteryes.com/db/crear-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`Error en ${numeroUnico}: ${response.status} ${response.statusText}`);
        }
        const responseData = await response.json();
        console.log(`Chat creado para el número ${numeroUnico}:`, responseData);
        }
        console.log("chats ya creados")      
      }
    } catch (error) {
      console.error('Error al crear los chats:', error);
    }
      //validar chats existentes para no repetirlos
      async function verificarChatExistente(numero) {
      const idChat2 = numero; // Reemplaza esto con el valor real que deseas buscar
      try {
      const responseChatExistente = await fetch(`https://appcenteryes.appcenteryes.com/db/obtener-chat-id?idChat2=${idChat2}`, {
      method: 'GET',
      headers: {
      'Content-Type': 'application/json',
    },
    });
  if (!responseChatExistente.ok) {
    throw new Error(`Error en la solicitud: ${responseChatExistente.status} ${responseChatExistente.statusText}`);
  }
  const chatsExistentes = await responseChatExistente.json();
  console.log('Chat obtenido por ID:', chatsExistentes);
  return chatsExistentes
  } catch (error) {
  console.error('Error al obtener el chat por ID:', error);
  }  
}
// Función para distribuir mensajes equitativamente entre usuarios 
      //obtener chats
      try {
        const response = await fetch('https://appcenteryes.appcenteryes.com/db/obtener-chats');
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const chatsExistentes = await response.json();
        console.log('Chats obtenidos:', chatsExistentes);
        const chatsConUserId = chatsExistentes.filter(chat => chat.userId!== 0);
        const idsChatasignados = chatsConUserId.map(objeto => objeto.userId);
        const chatsSinUserId = chatsExistentes.filter(chat => chat.userId == 0 && chat.status == 'pending' || null);
        const idsChatsinasignar = chatsSinUserId.map(objeto => objeto.userId);
        const idsChats =  idsChatasignados.concat(idsChatsinasignar);
        const chatsParaAsignar = idsChats.filter(value => value !== null && value !== 0);
        const responseUsuarios = await fetch('https://appcenteryes.appcenteryes.com/db/obtener-usuarios');
        const usuarios = await responseUsuarios.json();   
        const usuariosActivos = usuarios.filter((usuario) => usuario.session === 'Activo' && usuario.type_user ==='Asesor');
        const idsUactivos = usuariosActivos.map(objeto => objeto.id);
        var frecuenciaNumeros = {};
        chatsParaAsignar.forEach(numero => {
        frecuenciaNumeros[numero] = (frecuenciaNumeros[numero] || 0) + 1;
        });
        if (chatsParaAsignar.length === 0) {
        elementoSeleccionado = idsUactivos[Math.floor(Math.random() * idsUactivos.length)];
        }
        // Encuentra el valor mínimo en las frecuencias
      console.log("Frecuencia de números:", frecuenciaNumeros);
      var elementoSeleccionado;
      // Verifica si chatsSinUserId es un array o no
if (chatsSinUserId.length>1) { 
        chatsSinUserId.forEach(async(chat)=>{
          console.log("holaaaaa",chatsSinUserId)
          async function actualizarUsuarioChat(idChat2, nuevoUserId) {
            try {
              var valoresFrecuencia = Object.keys(frecuenciaNumeros).map(Number);
        var minimoValorFrecuencia = Math.min(...valoresFrecuencia);

        // Obtén las frecuencias del valor mínimo
        var frecuenciasMinimas = frecuenciaNumeros[minimoValorFrecuencia];
        
        // Si hay más de una frecuencia mínima, selecciona un valor al azar
        let elementosSeleccionados = [];
        if (frecuenciasMinimas > 1) {
        for (const numero in frecuenciaNumeros) {
        if (frecuenciaNumeros[numero] === frecuenciasMinimas) {
            elementosSeleccionados.push(Number(numero));
            
        }
        }
        
        elementosSeleccionados = [...new Set(elementosSeleccionados.concat(idsUactivos))];
        elementosSeleccionados = elementosSeleccionados.filter((valor) => idsUactivos.includes(valor))
        console.log(elementosSeleccionados)
        var indiceAleatorio = Math.floor(Math.random() * elementosSeleccionados.length);
        elementoSeleccionado = elementosSeleccionados[indiceAleatorio];
        } else {
      elementoSeleccionado = minimoValorFrecuencia;
      }
        const response = await fetch('https://appcenteryes.appcenteryes.com/db/actualizar-usuario-chat', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idChat2, nuevoUserId }),
              });
          
              if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} ${response.statusText} ${idChat2}`);
              }
            
              const resultado = await response.json();
              console.log('Respuesta de la actualización:', resultado);
              
              return resultado;
            } catch (error) {
              console.error('Error al actualizar el usuario del chat:', error);
              // Puedes lanzar el error nuevamente o manejarlo según tus necesidades
              throw error;
            }
            
          }
        
          // Uso de la función
          const idChat2 = chat.idChat2;// Reemplaza con el idChat2 correcto
          const nuevoUserId = elementoSeleccionado; // Reemplaza con el nuevo valor de userId
          try {
        
            const resultadoActualizacion = await actualizarUsuarioChat(idChat2, nuevoUserId);
            console.log(resultadoActualizacion)
            // Aquí puedes manipular la información del resultado según tus necesidades
          } catch (error) {
            // Manejar el error, por ejemplo, mostrar un mensaje al usuario
            console.error('Error general:', error.message);
          }
        }
        )
    }else {
    // Lógica para un solo elemento en chatsSinUserId
      console.log("entra al else", chatsSinUserId);

    try{
    // Lógica para un solo elemento
    var indiceAleatorio = Math.floor(Math.random() * idsUactivos.length);
    elementoSeleccionado = idsUactivos[indiceAleatorio];
    const response = await fetch('https://appcenteryes.appcenteryes.com/db/actualizar-usuario-chat', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idChat2: chatsSinUserId[0].idChat2, nuevoUserId: elementoSeleccionado }),
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText} ${chatsSinUserId.idChat2}`);
    }

    const resultado = await response.json();
    console.log('Respuesta de la actualización:', resultado);

    // Aquí puedes manipular la información del resultado según tus necesidades
  } catch (error) {
    console.error('Error al actualizar el usuario del chat:', error);
    // Puedes lanzar el error nuevamente o manejarlo según tus necesidades
    throw error;
  }
}
       //obtener usuarios activos
        try {
          const response = await fetch('http://https://appcenteryes.appcenteryes.com/db/obtener-usuarios', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // Agrega cualquier otra cabecera que sea necesaria, como token de autorización, si es aplicable
            },
          });
          if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
          }
          const usuarios = await response.json();       
          // Filtra solo los usuarios activos
          const usuariosActivos = usuarios.filter((usuario) => usuario.session === 'Activo');
          console.log('Usuarios activos:', usuariosActivos); 
        } catch (error) {
          console.error('Error al obtener usuarios:', error);
          // Maneja el error según tus necesidades
        }

      } catch (error) {
        console.error('Error al realizar la solicitud:', error);
      }
      //obtener activos
     
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      // Maneja el error según tus necesidades
    }
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
//solicitud de usuarios activos en gupshup
app.get('/w/api/users', async (req, res) => {
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
// Ruta para manejar la petición POST
app.post('/w/partner/account/login', async (req, res) => {
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

//Post templates
app.post('/w/createTemplates', async (req, res) => {
  try {
    const appId = 'cef6cd40-330f-4b25-8ff2-9c8fcc434d90'; // Reemplaza con tu ID de aplicación real
    const partnerAppToken = 'sk_ce0c81f1783e4e86828863ebf2d9c3fa'; // Reemplaza con tu token de partner real
    const apiUrl = `https://partner.gupshup.io/partner/app/${appId}/templates`;

    const templateData = req.body; // Los datos de la plantilla provienen del cuerpo de la solicitud

    const response = await axios.post(apiUrl, templateData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Connection': 'keep-alive',
        'token': partnerAppToken,
      },
    });
    

    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error:', error.message || error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get templates
app.get('/w/gupshup-templates', async (req, res) => {
  try {
    const appId = 'cef6cd40-330f-4b25-8ff2-9c8fcc434d90';
    const partnerAppToken = 'sk_ce0c81f1783e4e86828863ebf2d9c3fa';
    const apiUrl = `https://partner.gupshup.io/partner/app/${appId}/templates`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Connection': 'keep-alive',
        'token': partnerAppToken,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error.message || error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//DELETE TEMPLATES
app.delete('/w/deleteTemplate/:elementName', async (req, res) => {
  try {
    const appId = 'cef6cd40-330f-4b25-8ff2-9c8fcc434d90';
    const partnerAppToken = 'sk_ce0c81f1783e4e86828863ebf2d9c3fa';
    const elementName = req.params.elementName;

    const apiUrl = `https://partner.gupshup.io/partner/app/${appId}/template/${elementName}?id=${elementName}`;

    const response = await axios.delete(apiUrl, {
      headers: {
        Authorization: partnerAppToken,
      },
    });

    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error:', error.message || error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor y Socket.IO escuchando`);
});
