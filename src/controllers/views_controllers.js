/* views_controllers.js */
import CartDao from "../DAO/CartDao.js"
import UserDao from "../DAO/UserDao.js";
import { productsModel } from "../DAO/model/products.model.js";
import config from "../config/config.js";
import { generateProducts } from "../services/mocks/productsFaker.js";

const userDao = new UserDao();
const cartDao = new CartDao();

const ctrl_Home = (req, res) => {
    
    res.render("login", {style:"login.css"});
};

const ctrl_RealtimeProducts = (req, res) => {
    res.render("realTimeProducts", {style:"realtimeproducts.css"});
};

const ctrl_Chat = (req, res) => {
    res.render("chat", {style:"chat.css"});
};

const ctrl_Products = async (req, res) => {
        try {
            const { page = 1, limit = 10, sort, query } = req.query;

            const userEmail = req.session.admin ? config.ADMIN_MAIL : req.session.user;
            const session = req.session.admin ? req.session.admin : req.session.user; 
            const userCart = req.session.cart;

            // Función auxiliar para verificar el rol del usuario
            const getUserRole = async (email) => {
                if (email === req.session.admin) {
                    console.log("Entro aca");
                    return "admin"; // Consideramos al usuario con correo "admin@example.com" como admin
                }else{
                    const user = await userDao.getByEmail(email);
                    return user.role;
                }
            };
            console.log(session);
            const userRole = await getUserRole(session);
            const isPremiumOrAdmin = userRole === "premium" || userRole === "admin";
            const isAdmin = userRole === "admin";

            //Configuro opciones de paginación y filtrado
            const options = {
                page: parseInt(page), // Página actual
                limit: parseInt(limit), // Límite de elementos por página
                sort: sort === 'asc' ? 'price' : sort === 'desc' ? '-price' : null, // Ordenamiento ascendente o descendente por precio
                lean: true, // Obtener resultados como objetos JSON simples
            }; 
            // Crear objeto de búsqueda con filtros
            const filters = {};
            if (query) {
            filters.$or = [
                { category: { $in: [query] } },
                { title: { $in: [query] } },
                { description: { $in: [query] } },
            ];
            }
            // Obtengo los productos paginados y filtrados aplicando las opciones
            const result = await productsModel.paginate(filters, options);
            // Creo un variable de datos para pasar a la vista con lo que pide la consigna
            const data = {
                status: 'success',
                userRole,
                isPremiumOrAdmin: isPremiumOrAdmin,
                isAdmin: isAdmin,
                userEmail, //Mail del usuario
                userCart,
                payload: result.docs, // Productos obtenidos
                style: 'products.css', // Aplico estilos a la vista
                totalPages: result.totalPages, // Número total de páginas
                prevPage: result.hasPrevPage ? result.prevPage : null, // Página anterior (null si no existe)
                nextPage: result.hasNextPage ? result.nextPage : null, // Página siguiente (null si no existe)
                page: result.page, // Página actual
                hasPrevPage: result.hasPrevPage, // Indicador para saber si la página previa existe
                hasNextPage: result.hasNextPage, // Indicador para saber si la página siguiente existe
                prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${limit}` : null, // Enlace a la página anterior (null si no existe)
                nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&limit=${limit}` : null // Enlace a la página siguiente (null si no existe)
            };
            //Agrego una validación, para ver si la página existe o no
            if (page > result.totalPages) {
                throw new Error("La página no existe");
            }else{
            // Renderizo la vista 'products' y paso datos con toda la info
            res.render('products', data);
            }
        } catch (error) {
            res.status(500).send('Error en el server');
        }
}

const ctrl_Cart = async (req, res) => {
//Renderízo la vista carts y adjunto su hoja de estilos
try {
    let id = req.params.cid;
    let user = req.session.user
    const cart = await cartDao.getCartsById(id);
    res.render("cart", { cart: JSON.parse(JSON.stringify(cart[0])), user: user, style: "cart.css"});
} catch (error) {
    req.logger.error(error);
}
}

const ctrl_MockingProducts = async (req, res) => {
    try {
        let products = generateProducts(100);
        
        res.render("mockingProducts", {products})
    } catch (error) {
        req.logger.error(error);
    }
}

const ctrl_LoggerTest = async (req, res) => {
    try {
        //Fuerzo un log de cada estilo, para cumplir con la consigna de la clase
        req.logger.fatal("Prueba de fatal")
        req.logger.error("Prueba de Error")
        req.logger.warning("Prueba Warning")
        req.logger.info("Prueba de Info")
        req.logger.http("Prueba de http")
        req.logger.debug("Prueba de debug")
        
        res.render('LoggerTest', { logger: req.logger }); //También genero un entorno gráfico para hacerlo más visual
    } catch (error) {
        req.logger.error(error);
    }
}



export {ctrl_Home, ctrl_Cart, ctrl_Chat, ctrl_Products, ctrl_RealtimeProducts, ctrl_MockingProducts, ctrl_LoggerTest};

