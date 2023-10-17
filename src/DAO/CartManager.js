import fs from "fs"
import ProductManager from "./ProductManager.js";
import { logger } from "../utils/logger.js";

const manager = new ProductManager();

class CartManager{

constructor(){
    this.path = "./carts.json";
}

async idGenerator(){
    let cart = await this.readCarts();
    let resultado = cart.length + 1;
    return resultado
}

async readCarts(){
    try {
        //Busco la lista de carritos
        let carts = await fs.promises.readFile(this.path, "utf-8")
        return JSON.parse(carts) //Los devuelvo como objeto
    } catch (error) {
        logger.error(error);
    }
}

async getCarts(){
    try {
        //Traigo la lista de carritos y la devuelvo
        let carts = await this.readCarts();
        return carts;
    } catch (error) {
        logger.error(error);
    }
}

async getCartsById(id){
    try {
        //Traigo la lista de carritos
        let carts = await this.readCarts();
        //Valodo si existe el ID del carrito
        let existe = carts.find(prod => prod.id == id);
        if (existe) {
            return existe; //Si existe lo devuelvo
        }else {
            return "Cart Not Found"
        }
    } catch (error) {
        logger.error(error);
    }
}

async addCarts(){
    let carritos = await this.readCarts();
    let carrito = 
        {
            "id": await this.idGenerator(),
            "products": []
        }
    carritos.push(carrito)
    await fs.promises.writeFile(this.path, JSON.stringify(carritos));
    return{status:"Existoso", msg:`Se agregó el carrito con ID: ${carrito.id}`};
}

async addProductToCart(cid, pid){
//Traigo la lista de carritos
let carts = await this.readCarts();
//Valido si existe el carrito al que se quiere agregar productos
let existeCart = carts.find(elem => elem.id == cid);
if (existeCart) {
    //Si existe el carrito voy a buscar la lista de productos
    let products = await manager.readProducts(); 
    //Traigo la lista de productos y valido si el producto es real
    let productoExiste = products.find(elem => elem.id == pid)
    if (productoExiste) {
        //Debo validar si el producto ya no se encuentra en el carrito seleccionado
        let existeEnCarrito = existeCart.products.find(elem => elem.id == pid)
        if (existeEnCarrito) {
            existeEnCarrito.quantity++;
            await fs.promises.writeFile(this.path, JSON.stringify(carts));
        }else{
            //Argego el producto con quantity 1
            existeCart.products.push({
                            id: parseInt(pid),
                            quantity: 1
                            })
        await fs.promises.writeFile(this.path, JSON.stringify(carts))
        }
    }else{
        //Si el producto no es real, aviso que no existe
        return({status:`El proudcto ${pid}, no existe`})
    }
}else{
    //Si no existe el carrito
    return({status:`Su carrito ${cid}, no existe`})
}
}
}

export default CartManager;