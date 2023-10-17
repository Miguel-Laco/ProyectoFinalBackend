/* carts.js */
const socket =io();

function deleteProduct(cid, pid) {
  console.log(cid);
  console.log(pid);
  socket.emit("deleteProductFromCart", {cid, pid});
}


function purchase (cid) {
  socket.emit("purchaseCart", cid)
}

socket.on("purchaseCart-confirm", (data) => {
  // Redirige al usuario a la URL
  window.location.href = `${data.url}`;
});

socket.on("purchaseCart-cancel", (data) => {
  Swal.fire({
    title: "Compra cancelada",
    text: "No tenemos stock de los productos que desea",
    icon: "cancel",
  });
  //Agrego momentaneamente un reload. Luego recibiré la lista de productos por socket, al igual que en realtimeproducts
  //Hoy entiendo que no lo pide la consigna esto que hago.
});


//Esucho si devuelve una confirmación
socket.on("deleteProductFromCart-confirm", addPorduct => {
  Swal.fire({
    title: "Producto eliminado",
    text: addPorduct.message,
    icon: "success",
  });
  //Agrego momentaneamente un reload. Luego recibiré la lista de productos por socket, al igual que en realtimeproducts
  //Hoy entiendo que no lo pide la consigna esto que hago.
  window.location.reload();
});

//Escucho si devuelve un error
socket.on("deleteProductFromCart-error", error => {
  Swal.fire({
    title: "Error al eliminar producto",
    text: error.message,
    icon: "error",
  });
});

