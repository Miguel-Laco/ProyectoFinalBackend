import config from "../../config/config.js";

/* realTimeProducts.js */
const socket =io();
// io hace referencia a "socket.io, se llama así por convención"
// La linea 1 permite instanciar el socket y guardarlo en la constante "socket"
// Dicho socket es el que utilizaremos para comunicarnos con el socket del servidor
// Este lado es el "CLIENTE"



//Mapeo la constante con el elemento que utilizaré como contenedor de mis tarjetas luego
const listProduct = document.getElementById("contenedorProductos");

//Creo una función que renderizará las tarjetas de productos que lleguen por websocket
//Agrego una validación de thumbnail para que renderice una, dos o ningúna imagen.
//Cada botón lleva su propia función onClick que llama a la función productDelete y envía su ID
const renderProduct = (productData) => {
    listProduct.innerHTML = "";
    const html = productData.products.map((productInfo) => {
    listProduct.innerHTML += '<div class="col my-2">' +
        '<div class="card text-center" style="width: 12rem;">' +
        '<p class="card-text">ID: ' + productInfo._id + '</p>' +
        '<h5 class="card-title">' + productInfo.title + '</h5>' +
        '<div class="card-body">' +
        (productInfo.thumbnail && productInfo.thumbnail[0] ? '<img src=' + productInfo.thumbnail[0] + ' class="card-img-top" alt="' + productInfo.title + '-1">' : '') +
        (productInfo.thumbnail && productInfo.thumbnail[1] ? '<img src=' + productInfo.thumbnail[1] + ' class="card-img-top" alt="' + productInfo.title + '-2">' : '') +
        '<p class="card-text">CODE: ' + productInfo.code + '</p>' +
        '<p class="card-text">DESC: ' + productInfo.description + '</p>' +
        '<p class="card-text">$ ' + productInfo.price + '</p>' +
        '<p class="card-text">STATUS: ' + productInfo.status + '</p>' +
        '<p class="card-text">CAT: ' + productInfo.category + '</p>' +
        '<p class="card-text">STOCK: ' + productInfo.stock + '</p>' +
        '<p class="card-text">OWNER: ' + productInfo.owner + '</p>' +        
        '<button type="button" class="btn btn-danger" onclick="productDelete(\'' + productInfo._id + '\')">Borrar</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    });
};


//Comienzo a escuchar al servidor, para recibir listaProductos y mando la información a la función que renderiza
socket.on("listaProductos", renderProduct)


async function productDelete(id) {
    try {
        const response = await fetch(`${config.DOMAIN}/api/products/${id}`, {
        method: 'DELETE',
        });
        if (response.ok) {
            await Swal.fire({
                title: "Se eliminó el producto",
                text: "Si el owner del producto era premium, fue notificado ",
                icon: "success",
            });
            socket.emit("reload")
        } else {
            await Swal.fire({
                title: "Error",
                text: "Error al eliminar el producto",
                icon: "error",
        });
        socket.emit("reload")
    }
    } catch (error) {
        console.error('Error en la solicitud DELETE:', error);
    }
}


//Agrego la lógica para enviar al server los valores del formulario y crear un producto
const form = document.querySelector("form");
document.querySelector("button").addEventListener("click", () => {
    const title = form.elements.title.value;
    const description = form.elements.description.value;
    const code = form.elements.code.value;
    const price = form.elements.price.value;
    const stock = form.elements.stock.value;
    const category = form.elements.category.value;
    const thumbnail = form.elements.thumbnail.value;
    const owner = "admin"


    //Mando al server los valores
    socket.emit("crearProducto", { title, description, code, price, stock, category, thumbnail, owner });
});


console.log("Script desde una plantilla");

