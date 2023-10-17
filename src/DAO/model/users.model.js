/* users.model */
import mongoose from "mongoose";
import config from "../../config/config.js";

const usersCollection = config.COLLECTION_USERS;

const UserSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: {type: String, unique: true},
    password: String,
    age: Number,
    cart: {type:mongoose.Schema.Types.ObjectId, ref: config.COLLECTION_CARTS},
    role: {type: String, default: "user"},
    documents: [
        {
            name: String,
            reference: String
        }
    ],
    last_connection: String
});


export const usersModel = mongoose.model(usersCollection, UserSchema)