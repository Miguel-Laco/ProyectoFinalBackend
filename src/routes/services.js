/* services Router.js */
import { Router } from "express";
import { mailToken } from "../utils/jwt.js";
import { 
    ctrl_GET_Mail, 
    ctrl_POST_resetPassword,
    ctrl_changePassword,
    ctrl_solicitudChangePassword
} from "../controllers/services_controllers.js";


const servicesRouter = Router();

//Creo una ruta para generar la solicitud de correo para cambio de contraseña
servicesRouter.get("/mail", ctrl_solicitudChangePassword)

//Creo una ruta para enviar correos
servicesRouter.post("/sendMail", ctrl_GET_Mail);

//Creo una ruta para mostrar la pantalla de cambio de password
servicesRouter.get("/changePassword", mailToken, ctrl_changePassword)

//Creo una ruta para cambiar el password y le agrego una validación del token para cumplir con la expiración del link
servicesRouter.post("/reset-password", ctrl_POST_resetPassword);

export default servicesRouter;
