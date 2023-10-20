/* app.js */
import express from "express";
import session from "express-session"; // Desinstalar
import productRouter from "./routes/products.js";
import cartRouter from "./routes/carts.js";
import servicesRouter from "./routes/services.js";
import views from "./routes/views.js"
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import MessagesDAO from "./DAO/MessagesDao.js";
import ProductDao from "./DAO/ProductDao.js";
import CartDao from "./DAO/CartDao.js";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import sessionRouter from "./routes/session.js";
import usersRouter from "./routes/users.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import fetch from 'node-fetch';
import errorHandler from "./middlewares/errors/errors.js"
import { addLogger, logger } from "./utils/logger.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import { swaggerOptions } from "./swagger-options.js";
import UserDao from "./DAO/UserDao.js";


const app = express(); //Inicializo el modulo express y estará contenido en app
const PORT = config.PORT || 8081;
const server = app.listen(PORT, () => logger.info(`Servidor escuchando puerto ${server.address().port}`));
server.on("error", error => logger.error(error))
const socketServer = new Server(server); //SocketServer será un servidor para trabajar con sockets

mongoose.connect(config.MONGO_URL)
    .then(() => console.log('Database connected'))
    .catch(err => logger.error(err))

    /* Incorporo swagger a mi proyecto, para documentación. */
const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

app.use(session({
    store:MongoStore.create({
        mongoUrl: config.MONGO_URL,
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 4000
    }),
    secret: config.SESSION_SECRET, //Defino la clave de encripción
    resave:true, //resave, define si la sesion caduca por inactidad
    saveUninitialized:false //Permite guardar cualquier sesion, aún cuando no tenga información.
}))

initializePassport();//Inicializo Passport
app.use(addLogger) //Aplico el middleware que generé para el Logger
app.use(passport.initialize());//Inicializo Passport
app.use(passport.session());//Inicializo Passport Session
app.use(cookieParser()); //Inicializo cookieParser
app.use(express.urlencoded({extended: true})); //Para que el server interprete urlencoded
app.use(express.json()); //Para que interprete mensajes tipo JSON

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionRouter);
app.use("/", views);
app.use("/api/services", servicesRouter); //Genero un rotuer para mi servicio de Mailing
app.engine("handlebars", handlebars.engine({ noEscape: true })); //Inicializo el motor de plantillas
app.set("views", "./src/views"); //Indico donde estarán las vistas
app.set("view engine", "handlebars"); //Indicamos que para renderizar, utilice handlebars
app.use(`/public`, express.static(`./src/public`));



const manager = new ProductDao(); //Inicializo la clase con los métodos para trabajar con MongoDB los productos
const Messages = new MessagesDAO();  //Inicializo la clase con los metodos del chat
const cartDao = new CartDao();
const userDao = new UserDao();

app.use(errorHandler); //Importo el middleware que generé para el manejo de errores

//Comienzo a escuchar la conección de un socket
socketServer.on(`connection`, async (socket) => {
    //Muestro por log que se conectó un nuevo cliente
    logger.info("Nuevo Cliente Conectado");
    //Enviío la lista de productos al socket conectado
        let products = await manager.getProducts();
        socket.emit("listaProductos",  {
            products
        })

    //Comienzo a escuchar el socket, para crear un producto
    socket.on("crearProducto", async (data) => {
        logger.info(data);
        //Luego lo envío a la función addProducts, la data recibida del socket
        await manager.addProduct( data.title, data.description, data.code, data.price, data.stock, data.category, data.thumbnail, data.owner)
    })
    

    //Comienzo a esuchar el socket, para eliminar un producto
    socket.on("productDelete", async (id) => {
        //Luego lo envío a la función deleteProducts
            await manager.deleteProduct(id);
            //Enviío la lista de productos, para que se actualicen los cambios
        let products = await manager.getProducts();
        socket.emit("listaProductos",  {
            products
        })
    })

    //Comienzo a escuchar historial, para enviar el historico del chat del canal.
    socket.on("historial", async ()=>{
        socketServer.emit("messageLogs", await Messages.getMessages())
    })

    //Comienzo a escuchar message, para recibir la info del chat
    socket.on("message", async (data) =>{
        //Guardo en la colección el usuario y el mensaje
        await Messages.addMessages(data.user, data.message)
        //Envío a todos los clientes los mensajes
        socketServer.emit("messageLogs", await Messages.getMessages())
    })

    //Comienzo a escuchar productToAdd, para agregar un producto al carrito
    socket.on("productToAdd", async ({cid, pid}) =>{
            try {
                if (cid === "") {
                    socket.emit("productAdd-admin")
                    console.log("entro aca");
                }else{
                    const addPorduct = await cartDao.addProductToCart(cid,pid)
                    socket.emit("productAdd-confirm", addPorduct)
                }
            } catch (error) {
                logger.error(error);
                socket.emit("productAdd-error", { message: error.message });
            }
    })

    //Comienzo a escuchar deleteProductFromCart, para eliminar un producto del carrito
    socket.on("deleteProductFromCart", async ({cid, pid}) =>{
            try {
            const deleteProductFromCart = await cartDao.removeProductFromCart(cid,pid)
            socket.emit("deleteProductFromCart-confirm", deleteProductFromCart)
            } catch (error) {
                logger.error(error);
                socket.emit("deleteProductFromCart-error", { message: error.message });
            }
    })

    socket.on("purchaseCart", async (cid) => {
            try {
            const response = await fetch(`${config.DOMAIN}/api/carts/${cid}/purchase`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
            });
            if (response.ok) {
                // Si la respuesta es exitosa, analizar el JSON y emitir el evento de confirmación
                const data = await response.json();
                socket.emit("purchaseCart-confirm", data);
            } else {
                // Si la respuesta indica un error (por falta de stock), realiza la redirección o renderizado en el cliente
                console.log('Error en la compra:', response.statusText);
                socket.emit("purchaseCart-cancel");
                // Realiza la redirección o renderizado de la vista "cancel" en el cliente
            }
            } catch (error) {
                // Manejo de errores en caso de problemas de red u otros errores
                console.error('Error:', error);
            }
    })

    socket.on("changeUserRole", async (email) => {
        try {
            await userDao.changeRol(email);
            socket.emit("reloadManager")
        } catch (error) {
            logger.error(error);
        }
    })

    socket.on("deleteUser", async email => {
        try {
            const user = await userDao.getByEmail(email);
            if (user) {
                const cart = user.cart;
                await userDao.deleteUser(email);
                if (cart) {
                    await cartDao.cartDelete(cart);
                }
                socket.emit("reloadManager");
            }
        } catch (error) {
            logger.error(error);
        }
    })

    socket.on("reload", async () =>{
        let products = await manager.getProducts();
        socket.emit("listaProductos",  {
            products
        })
    })

    socket.on("reloadpage", async () =>{
        try {
            socket.emit("reloadManager")
        } catch (error) {
            logger.error(error);
        }
    })

})