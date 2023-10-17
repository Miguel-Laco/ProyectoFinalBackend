import { logger } from "../utils/logger.js";
import {messagesModel} from "./model/messages.model.js"

class MessagesDao{

    constructor(){
        this.model = messagesModel;
    }

    async getMessages () {
        try {
            let messages = await messagesModel.find();
            return messages
        } catch (error) {
            logger.error(error);
        }
    }

    async addMessages (user, message) {
        let messages;
        try {
            messages = await messagesModel.create({
                user,
                message
            })
        } catch (error) {
            logger.error(error);
        }
        return messages
    }


}

export default MessagesDao;
