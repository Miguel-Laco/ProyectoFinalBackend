import fs from "fs"
import { logger } from "../utils/logger.js";

class ProductManager{

    constructor(){
        this.path = "./arregloProductos.json";
        //Agrego dos arreglos temporales, que utilizo para validaciones
        this.productTemp = [];
        }

    async idGenerator(){
        try {
                    //Sumo la cantidad de objetos en el .TXT + la cantidad en el arreglo temporal, para poder manejar el ID si se agregan varias objetos juntos.
        let productos = await this.readProducts();
        let resultado = productos.length + 1;
        return resultado
        } catch (error) {
            logger.error(error);
        }
    }

    async readProducts () {
        // Separo en un método la lectura del .TXT porque lo utilizo varias veces.
        try {
            let productos = await fs.promises.readFile(this.path, "utf-8"); //Busco la lista de productos
            return JSON.parse(productos); //Los convierto a objeto
        } catch (error) {
            logger.error(error);
        }
    }

    async getProducts () {
        try {
            let productos = await this.readProducts() //Busco la lista
            return productos //La devuevlo por consola
        } catch (error) {
            logger.error(error);
            }  
    }

    async getProductsById(id){
        let productos = await this.readProducts(); //Busco la lista
        let existe = productos.find(prod => prod.id == id); //Valido si existe el ID
        if (existe) {
            return existe; // Si existe, lo devuelvo por consola
        } else {
            return `ID: ${id}, Not Found`; // Si no existe, devuelvo "Not Found"
        }
    }

    async addProducts(title, description, code, price, stock, category, thumbnail){
        if (!title || !description || !code || !price || !stock || !category ){
            return {status:'Denegado',msg:'Debe colocar todos los campos'} ;
            }else{
                try {
                    let productos = await this.readProducts();
                //Antes de avanzar, valido que el producto traiga todos los campos
                    let nuevoProducto = {
                        id: await this.idGenerator(),
                        title,
                        description,
                        code,
                        price,
                        status: true,
                        stock,
                        category,
                        thumbnail:Array.isArray(thumbnail) ? thumbnail : [thumbnail] //Cambié la lógica para que reciba un arreglo de postman, o una única imagen de websocket
                    }
                    this.productTemp.push(nuevoProducto); //Los almaceno en un arreglo temporal
                    //Valido que el código no exista en el .TXT 
                    const existe = productos.find(prod => prod.code == nuevoProducto.code);
                        if (existe) {
                    console.log(`Su codigo de producto ${nuevoProducto.code} ya existe en la base y no será agregado`);
                            // Si se repite en algún lugar, vacío el temporal, para no saltear un ID en idGenerator
                            this.productTemp = []
                        } else{
                        //si esta todo ok, lo subo a otro temporal, que uso para validar luego que no vuelvan a sumar el mismo código de articulo y ya voy escribiendo el TXT
                            this.productTemp = []
                            productos.push(nuevoProducto);
                            await fs.promises.writeFile(this.path, JSON.stringify(productos))
                            return{status:"Success", msg:`Se creo: ${nuevoProducto.title}`};
                        }
                } catch (error) {
                    logger.error(error);
                }
            }
        
    }

    async updateProduct (id, campos) {
        try {
            let productos = await this.readProducts(); //Busco la lista
            let indice = productos.findIndex(prod => prod.id === id); //Busco el Indice
            if (indice !== -1) { //Si existe el Indice, reemplazo los campos que quiera modificar del objeto
                productos[indice] = {
                    ...productos[indice],
                    ...campos
                }
            console.log(productos[indice]); // Devuelvo por consola el objeto modificado
            await fs.promises.writeFile(this.path, JSON.stringify(productos)) // Escribo
            return{status:"Success", msg:`Se modificaron existosamente`};
        }else{
            return{status:"Error", msg:`Su ID: ${id}, no existe`};
        }
        } catch (error) {
            logger.error(error);
        }
    }

    
    async deleteProduct (id){
        try {
            let productos = await this.readProducts(); //Busco la lista
            let index = productos.findIndex(prod => prod.id == id); //Busco el Indice
        if (index !== -1){
               //Si existe, hago un "splice", que se para en la posicion seleccionada y borra 1 en este caso
            productos.splice(index, 1) 
            await fs.promises.writeFile(this.path, JSON.stringify(productos)) //Escribo
            return{status:"Success", msg:`Su product ID: ${id}, fue eliminado con éxito`};
            } else{
                return{status:"Error", msg:`Su product ID: ${id}, no existe`};
            }
        } catch (error) {
            logger.error(error);
        }
    }
}



// // DESAFÍO ENTREGABLE - PROCESO DE TESTING - CLASE 4

// // Se creará una instancia de la clase “ProductManager”
// // ***************************************************
let producto = new ProductManager();


// // Se llamará “getProducts” recién creada la instancia, debe devolver un arreglo vacío []
// // ***********************************************************************************
// producto.getProducts();


// // Se llamará al método “addProduct”  
// // El objeto debe agregarse satisfactoriamente con un id generado automáticamente SIN REPETIRSE
// // ****************************************************************
// producto.addProducts('sierra', 'cortar', 'SIE1', 1000, `10`, `herramientas`, ["./img/sierra1.jpg", "./img/sierra2.jpg"]);
// producto.addProducts('pala', 'excavar', 'PAL2', 2000, `20`, `herramientas`, ["./img/pala1.jpg", "./img/pala2.jpg"]);
// producto.addProducts('hacha', 'cortar', 'HAC3', 3000, `30`, `herramientas`, ["./img/hacha1.jpg", "./img/hacha2.jpg"]);
// producto.addProducts('martillo', 'clavar', 'MAR4', 4000, `40`, `herramientas`, ["./img/martillo1.jpg", "./img/martillo2.jpg"]);
// producto.addProducts('taladro', 'agujerear', 'TAL5', 5000, `50`, `herramientas`, ["./img/taladro1.jpg", "./img/taladro2.jpg"]);
// producto.addProducts('pico', 'picar', 'PIC6', 6000, `60`, `herramientas`, ["./img/pico1.jpg", "./img/pico2.jpg"]);
// producto.addProducts('brocha', 'pintar', 'BRO7', 7000, `70`, `herramientas`, ["./img/brocha1.jpg", "./img/brocha2.jpg"]);
// producto.addProducts('pinza', 'apretar', 'PIN8', 8000, `80`, `herramientas`, ["./img/pinza1.jpg", "./img/pinza2.jpg"]);
// producto.addProducts('metro', 'medir', 'MET9', 9000, `90`, `herramientas`, ["./img/metro1.jpg", "./img/metro2.jpg"]);
// producto.addProducts('fratacho', 'alisar', 'FRA10', 10000, `100`, `herramientas`, ["./img/fratacho1.jpg", "./img/fratacho2.jpg"]);


// // Se llamará el método “getProducts” nuevamente, esta vez debe aparecer el producto recién agregado
// // ***************************************************************************
// producto.getProducts();


// // Se llamará al método “getProductById” y se corroborará que devuelva el producto con el id especificado, en caso de no existir, debe arrojar un error.
// // ****************************************************************************
// producto.getProductsById(1);


// // Se llamará al método “updateProduct” y se intentará cambiar un campo de algún producto, se evaluará que no se elimine el id y que sí se haya hecho la actualización.
// // **************************************************************************
// producto.updateProduct(1, {title:"tenedor", stock: 500});


// // Se llamará al método “deleteProduct”, se evaluará que realmente se elimine el producto o que arroje un error en caso de no existir.
// // **********************************************************************
// producto.deleteProduct(4);


export default ProductManager;