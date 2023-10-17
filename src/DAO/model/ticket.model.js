import mongoose from "mongoose";
import config from "../../config/config.js";

const ticketsCollection = config.COLLECTION_TICKETS;

const TicketSchema = new mongoose.Schema({
code : {
    type: String, 
    unique: true
},
purchase_datetime: {
    type: String
},
amount: {
    type: Number
},
purchaser: {
    type: String
}
})

export const ticketsModel = mongoose.model(ticketsCollection, TicketSchema);