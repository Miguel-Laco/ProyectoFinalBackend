/* products.model.js */
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import config from "../../config/config.js";


const productsCollection = config.COLLECTION_PRODUCTS;

const ProductsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: Boolean,
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    thumbnail: Array,
    owner: {
        type: String,
        default: "admin"
    }
}, { strict: false })

//Configuro la paginación para mi cartsmodel
ProductsSchema.plugin(mongoosePaginate);

export const productsModel = mongoose.model(productsCollection, ProductsSchema);