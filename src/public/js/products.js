/* products.js*/

const socket = io(); // Conectarse al servidor a través de sockets


const addToCart = async (pid, cid) =>{
    // Envío por socket el id del producto y del cart elegido por el usuario
socket.emit("productToAdd", { pid, cid })
}

//Esucho si devuelve una confirmación
socket.on("productAdd-confirm", addPorduct => {
  Swal.fire({
    title: "Producto agregado",
    text: addPorduct.message,
    icon: "success",
  });
});

//Escucho si devuelve un error
socket.on("productAdd-error", (error) => {
  Swal.fire({
    title: "Error al agregar producto",
    text: error.message,
    icon: "error",
  });
});

//Escucho si el admin intenta agregar un producto al carrito
socket.on("productAdd-admin", () => {
  Swal.fire({
    title: "Error al agregar producto",
    text: "El Admin no puede agregar productos",
    icon: "error",
  });
});

