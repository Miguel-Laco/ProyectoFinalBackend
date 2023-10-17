/* users.js */
import { Router } from "express";
import { 
    ctrl_changeUserRol,
    ctrl_upload_Documents,
    crtl_upload,
    ctrl_getUsers,
    ctrl_deleteInactiveUsers,
    crtl_userManager
} from "../controllers/users_controllers.js";
import upload from "../utils/upload.js";
import { requireAdmin } from "../utils/jwt.js";


const usersRouter = Router();

//Creo una ruta que obtiene todos los usuarios. (Nombre, correo y Rol)
usersRouter.get("/", ctrl_getUsers)

//Creo una ruta que elimina y notifica a los usuario inactivos x+2días
usersRouter.delete("/", requireAdmin, ctrl_deleteInactiveUsers)

//Creo una ruta para cambiar el rol de usar a premium y al reves
usersRouter.get("/premium/:uid", ctrl_changeUserRol)

//Creo una ruta que permite subir documentos de los usuarios
usersRouter.post("/:uid/documents",upload.any(), ctrl_upload_Documents)

//Creo una ruta para mostrar una vista de upload
usersRouter.get("/upload/:uid", crtl_upload)

//Creo una ruta para poder visualizar, modificar el rol y eliminar un usuario
usersRouter.get("/manager", requireAdmin, crtl_userManager)



export default usersRouter;