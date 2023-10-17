/* carts.model */
import mongoose from "mongoose";
import config from "../../config/config.js";

const cartsCollection = config.COLLECTION_CARTS;

const CartsSchema = new mongoose.Schema({
    cart : {
        type: [
            {
                product:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref: config.COLLECTION_PRODUCTS
                },
                quantity:{
                    type: Number,
                    require: true
                }
            }
        ],
        default: []
    }

})

// Configuro un middleware para mongoose "pre"
// Con esto estaré poblando el rsultado del find() del carrito, para obtener los productos sin llamar a Populate

CartsSchema.pre(`find`, function(){
    this.populate(`cart.product`);
})


export const cartsModel = mongoose.model(cartsCollection, CartsSchema);