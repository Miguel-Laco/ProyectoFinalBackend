/* CartDao.js */
import { cartsModel } from "./model/carts.model.js";
import ProductDao from "./ProductDao.js";
import { logger } from "../utils/logger.js";
import { usersModel } from "./model/users.model.js";

const manager = new ProductDao();

class CartDao{

constructor(){
    this.model = cartsModel;
}

async getCarts(){
    try {
        //Traigo la lista de carritos y la devuelvo
        let carts = await cartsModel.find();
        return carts;
    } catch (error) {
        logger.error(error);
    }
}

async getCartsById(id){
    try {
        logger.info(`El id del cart a buscar es ${id}`);
        let cart = await cartsModel.find({_id: id})
        if (!cart) {
            throw new Error (`${cart} NO EXISTE`)
        }
        return cart
        } catch (error) {
        throw new Error(error.message)
    }
}

//Creo un carrito
async addCarts(){
    try {
        let cart = await cartsModel.create({
            products:{
                type: Array,
                default: []
            }
        })
        logger.info(`El Cart ${cart._id}, fue creado`);
        return cart
    } catch (error) {
        logger.error(error);
    }
    return{status:"Existoso", msg:`Se agregó el carrito con ID: ${cart.id}`};
}

// Agrego un producto al carrito
async addProductToCart(cid, pid){
    try {
        let cartID = await cartsModel.findOne({_id: cid})
        if (!cartID) {
            // Valido si el carrito existe
            throw new Error("El carrito no existe");
        }
        let productAdd = await manager.getProductsById(pid);
        if (!productAdd) {
            // Valido si el producto existe
            throw new Error("El producto no existe");
        }

        // Obtengo al usuario propietario del producto, para evitar agregar al carrito un producto cuyo dueño sea "premium"
        let productOwner = await usersModel.findOne({ email: productAdd.owner });
        if (productOwner) {
            // Verifica si el usuario propietario es premium
            if (productOwner.role === "premium") {
                throw new Error("No puedes agregar este producto al carrito porque el propietario es premium");
            }
        }
        

        // Busco si el producto ya existe en el carrito
        const productExist = cartID.cart.find((item) => item.product.equals(productAdd._id));
        
        if (productExist) {
            // Si el producto ya existe, incremento la cantidad
            await cartsModel.updateOne(
                { _id: cid, "cart.product": productAdd._id },
                { $inc: { "cart.$.quantity": 1 } }
            );
            return { status: "Éxito", message: "Producto agregado al carrito exitosamente" };
        } else {
            // Si el producto no existe, lo agrego al carrito
            cartID.cart.push({
            product: productAdd._id,
            quantity: 1,
        });
        await cartID.save();
        return { status: "Éxito", message: "Producto agregado al carrito exitosamente" };
        }
    } catch (error) {
        throw new Error(error.message)
    }
}

// Eliminar un producto del carrito
async removeProductFromCart(cid, pid) {
    try {
        const cart = await cartsModel.findOne({ _id: cid });
        if (!cart) {
            throw new Error("El carrito no existe");
        }
        const productIndex = cart.cart.findIndex((item) =>
            item.product.equals(pid)
        );
        if (productIndex === -1) {
            throw new Error("El producto no existe en el carrito");
        }
        cart.cart.splice(productIndex, 1); // Elimino el producto del arreglo cart
        await cartsModel.updateOne({ _id: cid }, { cart: cart.cart }); // Actualiza el carrito en la base de datos
        return { status: "Éxito", message: "Producto eliminado del carrito exitosamente" };
    } catch (error) {
        throw new Error(error.message)
    }
}

// Actualiza la cantidad de un producto específico en el carrito (POSTMAN)
async updateCart(cartId, productID, quantity) {
    try {
        const cart = await cartsModel.findOne({ _id: cartId });
        if (!cart) {
            return 'CartNotFound';
        }
        const cartItems = cart.cart;
        const product = await manager.getProductsById(productID);
        if (!product) {
            return 'ProductNotFound';
        }
        const existingItem = cartItems.find((item) => item.product.toString() === productID);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cartItems.push({
                product: productID,
                quantity: quantity,
            });
        }
        cart.cart = cartItems;
        await cart.save();
        return 'CartUpdated';
    } catch (error) {
        throw error;
    }
}



  // Actualizar la cantidad  de un producto en el carrito
async updateProductQuantity(cid, pid, quantity) {
    try {
        logger.info("ID" + cid);
        logger.info("PID" + pid);
        logger.info("cant" + quantity);
    const cart = await cartsModel.findOne({ _id: cid });
    if (!cart) {
        throw new Error("El carrito no existe");
    }
    const product = cart.cart.find((item) => item.product.equals(pid));
    if (!product) {
        throw new Error("El producto no existe en el carrito");
    }
      product.quantity = quantity; // Actualiza la cantidad del producto
    await cartsModel.updateOne(
        { _id: cid, "cart.product": pid },
        { $set: { "cart.$.quantity": quantity } } // Actualiza la cantidad del producto en la base de datos
    );
    } catch (error) {
    logger.error(error);
    }
}

// Vacío todo el carrito
async deleteCart(cid) {
    try {
    const cart = await cartsModel.findOne({ _id: cid });
    if (!cart) {
        throw new Error("El carrito no existe");
    }
    cart.cart = [];
    await cart.save();
    logger.info("Productos eliminados del carrito exitosamente");
    } catch (error) {
    logger.info(error);
    }
}

async cartDelete (id){
    try {
        logger.info(`El id del cart a eliminar es ${id}`);
        await cartsModel.deleteOne({_id: id}); //Busco la lista
        return {status:"Success", msg:`Su cart ID: ${id}, fue eliminado`}
    } catch (error) {
        return{status:"Error", msg:`Su cart ID: ${id}, no existe`};
    }
}

async pendingUpdate  (cartId, productsToKeep) {
    try {
        // Encuentra el carrito por su ID
        const cart = await cartsModel.findOne({ _id: cartId });

        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        // Reemplaza el contenido del carrito con los productos que se deben mantener
        cart.cart = productsToKeep;

        // Guarda el carrito actualizado en la base de datos
        await cart.save();
    } catch (error) {
        throw error;
    }
}


}



export default CartDao;