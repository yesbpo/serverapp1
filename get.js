//sdghdgjgfjfhj
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
const path = require('path');
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Reemplaza con tu dominio
    methods: ["GET", "POST"]
  }
});
const apiUrl = 'https://api.gupshup.io/sm/api/v1/template/list/YESVARIOS';
const apiUrlenvio = 'https://api.gupshup.io/sm/api/v1/msg';
const apiKey = 'thpuawjbidnbbbfrp9bw7qg03eci6rdz';
const apiUrluser = 'https://api.gupshup.io/sm/api/v1/users/YESVARIOS';
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
  res.header('Access-Control-Allow-Origin', 'https://appcenteryes.appcenteryes.com/'); // Permitir todos los orígenes (No recomendado en producción)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
const directorioCargas =   path.join(__dirname, '..', 'uploads'); // Carpeta para almacenar los archivos cargados

// Configuración de Multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, directorioCargas);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Puedes ajustar la lógica del nombre de archivo según tus necesidades
  },
});

const upload = multer({ storage: storage });

// Ruta para manejar la carga de archivos desde el cliente
app.post('/w/subir-archivo', upload.single('archivo'), (req, res) => {
  // Aquí deberías generar la URL del archivo y enviarla como respuesta al cliente
  const urlArchivo = `/w/uploads/${req.file.filename}`;
  res.json({ url: urlArchivo });
});

// Ruta para servir los archivos estáticos
app.use('/w/uploads', express.static(directorioCargas));



io.on('connection', (socket) => {
  // Manejar la desconexión del cliente
  socket.on('disconnect', () => {
    // Puedes agregar lógica adicional cuando un cliente se desconecta
  });
});// Ruta para recibir eventos del webhook
app.all('/w/api/index', async (req, res) => {
 
  const userAgent = req.get('User-Agent');
  // Verifica si la solicitud es del User-Agent específico
  if (userAgent) {
    try {
      var data = req.body;
      await processAsync(data);
      console.log(data);
      
      //aqui
       // console.log('entra en if3')
         // const data1 = {
            // Asigna el valor actual del contador y luego incrementa
           //idChat2: data.payload.source,
          // resolved: false,
           
           
         //};
         //console.log(data1.idChat2)
         //const response = await fetch('https://appcenteryes.appcenteryes.com/db/crear-chat', {
          // method: 'POST',
           //headers: {
            // 'Content-Type': 'application/json',
           //},
           //7body: JSON.stringify(data1),
       //  });
         //if (!response.ok) {
          // console.log('no exito')       
         
       //  const responseData = await response.json();
   //console.log(responseData)
          
          
     // }
      
      const fechaActual = new Date();
const options = { timeZone: 'America/Bogota', hour12: false };
const anio = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
const mes = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
const dia = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
const hora = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
const minutos = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
const segundos = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
      const number = data.payload.source || data.payload.destination;
      const content = data.payload.payload.text || data.payload.payload.url ;
      const type_comunication = data.type;
      const status = data.payload.type || 'null';
      const timestamp = `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
      const type_message = data.payload.type;
      const idMessage = data.payload.gsId || data.payload.id ;
       //condicional para determinar si el idMessage ya existe
       const mensaje = {
        content, type_comunication, status, number, timestamp, type_message, idMessage
      };
      console.log(mensaje)
      try {const response = await fetch('https://appcenteryes.appcenteryes.com/db/guardar-mensajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mensaje),
      });
    
      if (!response.ok) {
        console.error('Error en la solicitud:', response);
        throw new Error('Error en la solicitud');
      }
      const responseChat = await fetch('https://appcenteryes.appcenteryes.com/db/obtener-chats');
      const chats = await responseChat.json();
      const chatlimpio = chats.filter(chat=> chat.idChat2 == data.payload.source);
      
      if(data.type == 'message'){
        console.log('entra en if')
        singuardar()
        console.log('log de obtener',chatlimpio)
        
          console.log('entra en if2')
          if(chatlimpio[0].status == 'closed'){
            
            const data1 = {
            
              idChat2: chatlimpio[0].idChat2,
              resolved: false,
              status: 'pending',
              userId: 0,
            };
            const response = await fetch('https://appcenteryes.appcenteryes.com/db/crear-chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data1),
            });  
            if (!response.ok) {
              console.log('no exito')       
            }

          }
          async function singuardar (){
          if(chatlimpio.length === 0){
            console.log('entra en if33')
            
            console.log('log de obtener33',chatlimpio)
            
              console.log('entra en if2')
              const data5 = {
                
               idChat2: data.payload.source,
               resolved: false,
               status: 'pending',
               userId: 0,
             };
             const response = await fetch('https://appcenteryes.appcenteryes.com/db/crear-chat', {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
               },
               body: JSON.stringify(data5),
             });  
             if (!response.ok) {
               console.log('no exito')       
             }
             const responseData = await response.json();
              console.log(responseData)
             
          }
         const responseData = await response.json();
          console.log(responseData)
         
      }}
      //chats no creados
      

      const datamensaje = await response.json();
      // Manejar la respuesta según tus necesidades
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
      // Manejar el error según tus necesidades
    if(data.payload.conversation && data.payload.pricing){
    const datosAInsertar = {
      status: data.payload.type,
      attachments: data.payload.destination,
      message: data.payload.conversation.id,
      timestamp: `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`,
      idmessageTemplate: data.payload.id
    };
      const respnseweb = await fetch("https://appcenteryes.appcenteryes.com/db/insertar-datos-template", {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
           // Puedes agregar más encabezados según sea necesario
         },
         body: JSON.stringify(datosAInsertar)
         
       })
       if (!respnseweb.ok) {
        console.log('no exitoso')       
      }
            
      const respnse1 = await respnseweb.json();
      console.log(respnse1)
      
      }
     // const responseChat = await fetch('https://appcenteryes.appcenteryes.com/db/obtener-chats');
     // const chats = await responseChat.json();
     // const chatlimpio = chats.filter(chat=> chat.idChat2 == data.payload.source);
     // const chatlimpio1 = chatlimpio.filter(chat=> chat.status == 'closed')
      
     // if(chatlimpio[0].status == 'closed'&& data.type == 'message'){
      //  console.log('entra en if')
        
      //  console.log('log de obtener',chatlimpio)
        
       //   console.log('entra en if2')
        //  const data1 = {
            
        //   idChat2: chatlimpio[0].idChat2,
         //  resolved: false,
          // status: 'pending',
           //userId: 0,
         //};
         //const response = await fetch('https://appcenteryes.appcenteryes.com/db/crear-chat', {
          // method: 'POST',
          // headers: {
            // 'Content-Type': 'application/json',
           //},
           //body: JSON.stringify(data1),
         //});  
         //if (!response.ok) {
          // console.log('no exito')       
        // }
        // const responseData = await response.json();
         // console.log(responseData)
         
      //}
      
     } catch (error) {
      // Maneja cualquier error durante el procesamiento asíncrono
  
      res.status(500).send('Error interno del servidor.');
    }
    } else {
     //La solicitud no proviene de Gupshup, responde con un error
    res.status(403).send('Acceso no autorizado.');
    }
     //obtener mensajes
     
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
  
      // Filtra solo los usuarios activos
      const mensajesEntrantes = mensajes.filter(mensaje=> mensaje.type_comunication=='message')
      const numerosUnicos = [...new Set(mensajesEntrantes.map((mensaje) => mensaje.number))];
      console.log(numerosUnicos)
      async function normalizarNumero(numero) {
        // Eliminar caracteres no numéricos
        const numeroLimpio = numero.replace(/\D/g, '');
      
        // Si el número tiene 10 dígitos, agregar el prefijo '57'
        const numeroNormalizado = numeroLimpio.length === 10 ? '57' + numeroLimpio : numeroLimpio;
       
       
        return numeroNormalizado;
      }
      const existentes = await fetch('https://appcenteryes.appcenteryes.com/db/obtener-chats');
      let chatsvalidados =[];
      chatsvalidados = await existentes.json();
      console.log('log',chatsvalidados)
      try {
        const response = await fetch('https://appcenteryes.appcenteryes.com/db/obtener-chats');
        if (!response.ok) { 
        }
        const chatsExistentes = await response.json();
        const chatsConUserId = chatsExistentes.filter(chat => chat.userId!== 0);
        const idsChatasignados = chatsConUserId.map(objeto => objeto.userId);
        const chatsSinUserId = chatsExistentes.filter(chat => chat.userId == 0 && chat.status == 'pending');
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
      console.log(chatsExistentes);
      var elementoSeleccionado;
      // Verifica si chatsSinUserId es un array o no
if (chatsSinUserId.length>1) { 
  
        chatsSinUserId.forEach(async(chat)=>{
          async function actualizarUsuarioChat(idChat2, nuevoUserId) {
            try {
              var valoresFrecuencia = Object.keys(frecuenciaNumeros).map(Number);
        var minimoValorFrecuencia = Math.min(...valoresFrecuencia);

        // Obtén las frecuencias del valor mínimo
        var frecuenciasMinimas = frecuenciaNumeros[minimoValorFrecuencia];
        console.log
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
                body: JSON.stringify({ idChat2, nuevoUserId}),
              });
          
              if (!response.ok) {
              }
              console.log('2')
              const resultado = await response.json();
              return resultado;
            } catch (error) {
  
              // Puedes lanzar el error nuevamente o manejarlo según tus necesidades
              throw error;
            }
            
          }
          console.log('1')
          // Uso de la función
          const idChat2 = chat.idChat2;// Reemplaza con el idChat2 correcto
          const nuevoUserId = idsUactivos[Math.floor(Math.random() * idsUactivos.length)]; // Reemplaza con el nuevo valor de userId
          
          try {
        
            const resultadoActualizacion = await actualizarUsuarioChat(idChat2, nuevoUserId);
            console.log(resultadoActualizacion)
            // Aquí puedes manipular la información del resultado según tus necesidades
          } catch (error) {
            // Manejar el error, por ejemplo, mostrar un mensaje al usuario
  
          }
        }
        )
    }else {
    // Lógica para un solo elemento en chatsSinUserId
  

    try{
      console.log('si entra')
    // Lógica para un solo elemento
    var indiceAleatorio = Math.floor(Math.random() * idsUactivos.length);
    elementoSeleccionado = idsUactivos[indiceAleatorio];
    console.log(elementoSeleccionado)
    const response = await fetch('https://appcenteryes.appcenteryes.com/db/actualizar-usuario-chat', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idChat2: chatsSinUserId[0].idChat2, nuevoUserId: elementoSeleccionado }),
    });

    if (!response.ok) {
      console.log('error')
    }

    const resultado = await response.json();
    console.log("exitoso",resultado)
    console.log("exitoso",resultado)

    // Aquí puedes manipular la información del resultado según tus necesidades
  } catch (error) {
  
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
                      }
          const usuarios = await response.json();       
          // Filtra solo los usuarios activos
          const usuariosActivos = usuarios.filter((usuario) => usuario.session === 'Activo');
   
        } catch (error) {
  
          // Maneja el error según tus necesidades
        }

      }catch (error) {

      }
      const chatscreados = Array.isArray(chatsvalidados) ? chatsvalidados.map(chat => chat.idChat2) : [];
      var chatsparacrear = numerosUnicos.map(function (elemento, indice) {
        // Verificar si el índice existe en array2
        
        if (indice < chatscreados.length) {
            return elemento - chatscreados[indice];
        } else {
            // Si el índice no existe en array2, simplemente devolver el elemento de array1
            return elemento;
        }
    });
      //crear chats
      for (const chatparacrear of chatsparacrear) {
        const numeroNormalizado = await normalizarNumero(chatparacrear);
        
       
          const data2 = {
            // Asigna el valor actual del contador y luego incrementa
           idChat2:numeroNormalizado ,
           resolved: false,
           status: "pending",
           userId: 0,
           
         };
          const response2 = await fetch('https://appcenteryes.appcenteryes.com/db/crear-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data2),
        });
        if (!response2.ok) {

          console.log('no exito crear chat1')       
        
        const responseData2 = await response2.json();
  console.log('exito1',responseData2)
        }
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
    
  }
  const chatsExistentes = await responseChatExistente.json();
  
  return chatsExistentes
  } catch (error) {
  
  }  
}
// Función para distribuir mensajes equitativamente entre usuarios 
      //obtener chats
      try {
        const response = await fetch('https://appcenteryes.appcenteryes.com/db/obtener-chats');
        if (!response.ok) { 
        }
        const chatsExistentes = await response.json();
        const chatsConUserId = chatsExistentes.filter(chat => chat.userId!== 0);
        const idsChatasignados = chatsConUserId.map(objeto => objeto.userId);
        const chatsSinUserId = chatsExistentes.filter(chat => chat.userId == 0 && chat.status == 'pending');
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
      console.log(chatsExistentes);
      var elementoSeleccionado;
      // Verifica si chatsSinUserId es un array o no
if (chatsSinUserId.length>1) { 
  
        chatsSinUserId.forEach(async(chat)=>{
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
              }
              console.log('2')
              const resultado = await response.json();
              return resultado;
            } catch (error) {
  
              // Puedes lanzar el error nuevamente o manejarlo según tus necesidades
              throw error;
            }
            
          }
          console.log('1')
          // Uso de la función
          const idChat2 = chat.idChat2;// Reemplaza con el idChat2 correcto
          const nuevoUserId = idsUactivos[Math.floor(Math.random() * idsUactivos.length)]; // Reemplaza con el nuevo valor de userId
          
          try {
        
            const resultadoActualizacion = await actualizarUsuarioChat(idChat2, nuevoUserId);
            console.log(resultadoActualizacion)
            // Aquí puedes manipular la información del resultado según tus necesidades
          } catch (error) {
            // Manejar el error, por ejemplo, mostrar un mensaje al usuario
  
          }
        }
        )
    }else {
    // Lógica para un solo elemento en chatsSinUserId
  

    try{
      
    // Lógica para un solo elemento
    var indiceAleatorio = Math.floor(Math.random() * idsUactivos.length);
    elementoSeleccionado = idsUactivos[indiceAleatorio];
    console.log(elementoSeleccionado)
    const response = await fetch('https://appcenteryes.appcenteryes.com/db/actualizar-usuario-chat', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idChat2: chatsSinUserId[0].idChat2, nuevoUserId: elementoSeleccionado }),
    });

    if (!response.ok) {
      console.log('error')
    }

    const resultado = await response.json();
    console.log("exitoso",resultado)

    // Aquí puedes manipular la información del resultado según tus necesidades
  } catch (error) {
  
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
                      }
          const usuarios = await response.json();       
          // Filtra solo los usuarios activos
          const usuariosActivos = usuarios.filter((usuario) => usuario.session === 'Activo');
   
        } catch (error) {
  
          // Maneja el error según tus necesidades
        }

      } catch (error) {
  
      }
      //obtener activos
     
   
  }
  

);
// Función asíncrona para procesar la solicitud
async function processAsync(datas) {
  // Implementa lógica de procesamiento asíncrono aquí
  // Puedes realizar operaciones de larga duración, como llamadas a bases de datos, envío de correos electrónicos, etc.
}
// Configuración de Socket.IO

// envio mensajes
app.post('/w/api/envios', bodyParser.urlencoded({ extended: true }), async (req, res) => {
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
    
      // Enviamos la respuesta al cliente
      res.json(responseData);
    } else {
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Ruta para realizar la solicitud y devolver la respuesta al cliente de los templates
app.get('/w/api/templates', async (req, res) => {
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
    
    res.json(data.templates); // Devolver la respuesta al cliente
  } catch (error) {
    
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
    
    res.json(data); // Devolver la respuesta al cliente
  } catch (error) {
    
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
    
  // Aquí puedes realizar acciones con los datos, como autenticación y obtención del token
    // Por ahora, simplemente respondemos con los datos recibidos
    res.json({ email, password });
  } catch (error) {
    // Manejar errores aquí
    
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
    const appId = '2fdd13ac-c613-4d3a-a149-1ae6f33b576c'; // Reemplaza con tu ID de aplicación real
    const partnerAppToken = 'sk_52a3f753e59346b49aeaf466cb55aadb'; // Reemplaza con tu token de partner real
    const apiUrl = `https://partner.gupshup.io/partner/app/${appId}/templates`;

    const templateData = req.body; // Los datos de la plantilla provienen del cuerpo de la solicitud

    const response = await axios.post(apiUrl, templateData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Connection': 'keep-alive',
        'token': partnerAppToken,
      },
    });
    

    

    res.status(response.status).json(response.data);
  } catch (error) {
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get templates
app.get('/w/gupshup-templates', async (req, res) => {
  try {
    const appId = '2fdd13ac-c613-4d3a-a149-1ae6f33b576c';
    const partnerAppToken = 'sk_52a3f753e59346b49aeaf466cb55aadb';
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
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//DELETE TEMPLATES
app.delete('/w/deleteTemplate/:elementName', async (req, res) => {
  try {
    const appId = '2fdd13ac-c613-4d3a-a149-1ae6f33b576c';
    const partnerAppToken = 'sk_52a3f753e59346b49aeaf466cb55aadb';
    const elementName = req.params.elementName;

    const apiUrl = `https://partner.gupshup.io/partner/app/${appId}/template/${elementName}?id=${elementName}`;

    const response = await axios.delete(apiUrl, {
      headers: {
        Authorization: partnerAppToken,
      },
    });

    

    res.status(response.status).json(response.data);
  } catch (error) {
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Iniciar el servidor
server.listen(port, () => {
  
});
