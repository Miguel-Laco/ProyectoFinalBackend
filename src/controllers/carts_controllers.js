/* carts_controller.js */
import CartDao from "../DAO/CartDao.js"
import ProductDao from "../DAO/ProductDao.js";
import PaymentService from "../services/payments/payment.js";


const manager = new CartDao(); //Inicializo la clase
const productManager = new ProductDao();
const paymentService = new PaymentService();

const crtl_GET_Cart = async (req, res) => {
    try {
        res.send(await manager.getCarts());
    } catch (error) {
        req.logger.error(error);
    }
};

const crtl_GET_CartId = async (req, res) => {
    try {
        let id = req.params.cid;
        let response = await manager.getCartsById(id);
        if (!response) {
            throw new Error("El Cart ID proporcionado no existe");
        }
        res.send(response);
    } catch (error) {
        throw new Error(error.message);
    }
};

const crtl_POST_Cart = async (req, res) => {
    try {
        res.send(await manager.addCarts());
    } catch (error) {
        req.logger.error(error);
    }
};

const crtl_POST_ProdOnCart = async (req, res) =>{
    req.logger.info(req.owner);
    let cid= req.params.cid;
    let pid= req.params.pid;
    if (req.owner === "admin") {
        // Si es admin, permite la modificación sin importar quién sea el propietario
        req.logger.info(`Usted es ${req.owner} y no puede agregar productos a un carrito`)
        return res.status(403).send({ status: "error", msg: "Un ADMIN no puede agregar productos a un carrito" });
    } else {
        // Si no es admin, verificao si el producto pertenece al usuario premium
        const product = await productManager.getProductsById(pid);
        if (!product) {
            return res.status(404).send({ status: "error", msg: `El producto con ID ${id} no existe` });
        }
        if (product.owner === req.owner && req.user.role === "premium") {
            // Si el producto pertenece al usuario premium, NO le permite agregarlo al carrito
            req.logger.info(`Usted es ${req.owner} y NO puede agregar al carrito un producto creado por usted`)
            return res.status(403).send({ status: "error", msg: `Usted es ${req.owner} y NO puede agregar al carrito un producto creado por usted` });
        } else {
            req.logger.info(`Se agregó el ${product.title} al Cart ID: ${cid}`)
            // Si el producto no pertenece al usuario premium o el usuario no es premium, no tiene permisos para modificarlo
            res.send(await manager.addProductToCart(req.params.cid, req.params.pid));
        }
    }
}

const crtl_DEL_ProdOnCart = async (req, res) => {
    try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    await manager.removeProductFromCart(cartId, productId);
    res.send("Producto eliminado del carrito exitosamente");
    } catch (error) {
    req.logger.error(error);
    }
};

const crtl_DEL_CartId = async (req, res) => {
    try {
    const cartId = req.params.cid;
    await manager.deleteCart(cartId);
    res.send("Productos eliminados del carrito exitosamente");
    } catch (error) {
    req.logger.error(error);
    res.status(500).json({ error: "Error al eliminar los productos del carrito" });
    }
}

const crtl_PUT_CartId = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const bodyData = req.body;
        // Verifico si hay datos en el arreglo
        if (!Array.isArray(bodyData) || bodyData.length === 0) {
            return res.status(400).json({ error: 'Datos del producto no válidos' });
        }
        // Accedo al primer objeto del arreglo (asumiendo que solo envío uno)
        // Luego si voy a usar esta función, debería cambiar este codigo
        const { _id: productID, quantity } = bodyData[0];
        const message = await manager.updateCart(cartId, productID, quantity);
        if (message === 'CartNotFound') {
            return res.status(404).json({ error: 'El carrito no existe' });
        } else if (message === 'ProductNotFound') {
            return res.status(404).json({ error: 'El producto no existe' });
        }
        res.json({ message: 'Carrito actualizado exitosamente' });
    } catch (error) {
        req.logger.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


const crtl_PUT_ProdOnCart = async (req, res) => {
    try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity;
    await manager.updateProductQuantity(cartId, productId, quantity);
    res.send("Cantidad de producto actualizada exitosamente");
    } catch (error) {
    req.logger.error(error);
    }
};

const crtl_POST_purchase = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const response = await paymentService.createPaymentSession(cartId);
        if (response) {
            const url = response.sessionId.url;
            res.status(200).json({ url });
        } else{
            let data = "No hay stock de productos"
            res.status(500).json({ data })
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la compra' });
    }
}

const ctrl_GET_success = async (req, res) => {
    try {
        const purchaser = req.session.user;
        const cartId = req.session.cart;
        const response = await paymentService.paymentCheckOut(cartId, purchaser)
        let productsToKeep = JSON.parse(response.data.productsToKeep)
        res.render('success', {
            purchaser: response.data.purchaser,
            amount: response.data.amount,
            productsToKeep: productsToKeep,
            style: "success.css"});
    } catch (error) {
        console.log(error);
    }
    
}
const ctrl_GET_cancel = async (req, res) => {
    res.render('cancel');
}

export {crtl_DEL_CartId, crtl_GET_CartId, crtl_DEL_ProdOnCart, crtl_POST_ProdOnCart, crtl_PUT_ProdOnCart, crtl_GET_Cart, crtl_POST_Cart, crtl_PUT_CartId, crtl_POST_purchase, ctrl_GET_success, ctrl_GET_cancel}

