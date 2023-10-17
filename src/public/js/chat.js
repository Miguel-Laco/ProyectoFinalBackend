
const socket =io();
// io hace referencia a "socket.io, se llama así por convención"
// La linea 1 permite instanciar el socket y guardarlo en la constante "socket"
// Dicho socket es el que utilizaremos para comunicarnos con el socket del servidor
// Este lado es el "CLIENTE"


/* LOGICA CHAT */

// Creo una variable para almacenar el usuario del chat
let user;
let nombre = document.getElementById("nombre");

// Creo una función que renderiza el mail del usuario logueado en el chat
const renderNombre = () =>{
    nombre.innerHTML += `<P>${user}</p>`
}


let chatBox = document.getElementById("chatBox");

// Agrego un Sweet alert, que solo acepta un mail como login
Swal.fire({
    title: "Identificate para usar el CHAT",
    input: 'email',
    inputLabel: 'Your email address',
    inputPlaceholder: 'Enter your email address',
    allowOutsideClick:false
    // luego de registrarse, envío el correo a la función que muestra el mail en patalla
}).then(result => {user=result.value, renderNombre(user=result.value)})
    // Luego envío via socket una señal para que el servidor publique el historial que haya en la BD mediante messageLogs
    .then(()=>{
        socket.emit("historial")})
    // Comienzo a escuchar lo que tipea el usuario y lo envío vía socket
chatBox.addEventListener("keyup", evt=>{
    if(evt.key==="Enter"){
        if(chatBox.value.trim().length>0){
        socket.emit("message",{user:user,message:chatBox.value})
        chatBox.value="";
    }}
})

// escucho lo que devuelve el servidor por este canal, que serán todos los mensajes de los usuarios
socket.on("messageLogs", data => {
    let logOther = document.getElementById("other");
    let logSelf = document.getElementById("self");
    let messagesOther = "";
    let messagesSelf = "";
    // Creo una validación que separa los mensajes del usuario "registrado" (messaje.user), del resto de los mensajes
    data.forEach(message => {
      if (message.user === user) {
        messagesSelf += `<p class="self">${message.user} dice:</p>
                            <p>${message.message} </p>
                            <br>`
      } else {
        messagesOther += `<p class="other">${message.user} dice: ${message.message}</p>`;
      }
    });
  
    logOther.innerHTML = messagesOther;
    logSelf.innerHTML = messagesSelf;
  });
