import mongoose from "mongoose";
import config from "../../config/config.js";

const messagesCollection = config.COLLECTION_MESSAGES;

const MessagesSchema = new mongoose.Schema({
    user: String,
    message : {
        type: String,
        default: ""
    }
})

export const  messagesModel = mongoose.model(messagesCollection, MessagesSchema)