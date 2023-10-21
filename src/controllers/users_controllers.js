/* users_controllers.js */
import CartDao from "../DAO/CartDao.js";
import { UserDTO } from "../DAO/DTOs/user.dto.js";
import UserDao from "../DAO/UserDao.js";
import config from "../config/config.js";
import { sendMail } from "../services/email/email.js";
import { dateTwoDaysAgo} from "../utils/dateAndTime.js";
import { generateAuthToken } from "../utils/jwt.js";

const userDao = new UserDao;
const cartDao = new CartDao;

const ctrl_changeUserRol = async (req, res) => {
    try {
        //Tomo el email por parámetros y busco el ususario
        let uid = req.params.uid;
        let user = await userDao.getByEmail(uid);
        //Reviso si el usuario tien el rol user, para validar que tenga todos los documentos subidos.
        if (user.role === "user") {
            // Valido si el usuario tiene los documentos requeridos
            const hasIdentification = user.documents.some(doc => doc.name.includes('identification'));
            const hasProofOfAddress = user.documents.some(doc => doc.name.includes('proofOfAddress'));
            const hasBankStatement = user.documents.some(doc => doc.name.includes('bankStatement'));
            // Si tiene todos los documentos, realizo el cambio de rol
            if (hasIdentification && hasProofOfAddress && hasBankStatement) {
                req.logger.info(`El usuario cuenta con la documentación apropiada.`)
                user.role === "user" ? user.role = "premium" : user.role = "user";
                req.logger.info(`Se cambió el rol de ${user.email} a: ${user.role}`);
                await user.save();
                const tokenPayload = {
                    email: user.email,
                    role: user.role
                };
                const access_token = generateAuthToken(tokenPayload)
                res.cookie(config.AUTH_TOKEN, access_token, { httpOnly: true});
            } else {
                //Si no tiene los documentos, aviso e indico por consola, que documento le falta.
                req.logger.warning(`El usuario ${user.email} no tiene los documentos requeridos.`);
                if (!hasIdentification) {
                    req.logger.warning("Identification")
                }else if (!hasProofOfAddress){
                    req.logger.warning("ProofOfAddress")
                }else if (!hasBankStatement){
                    req.logger.warning("BankStatement")
                }
            }
            //Luego, vuelvo a cargar el perfil, actualizando el rol
            res.render('profile', { user: JSON.parse(JSON.stringify(user)), style: "profile.css" });
        }else{
            //Si es premium, permito el cambio de rol directamente.
            user.role === "user" ? user.role = "premium" : user.role = "user";
            req.logger.info(`Se cambió el rol de ${user.email} a: ${user.role}`);
            await user.save();
            res.render('profile', { user: JSON.parse(JSON.stringify(user)), style: "profile.css" });
        }

    } catch (error) {
        req.logger.error(error.message || "Error desconocido");
    }
}
const ctrl_upload_Documents = async (req, res) => {
    try {
        //Tomo los files del formulario y el user id de los parámetros
        let files = req.files
        let uid = req.params.uid
        //Llamo a la funcion del Dao que generé para subir los documentos
        await userDao.updateDocuments(uid, files)
        //Vuelvo a buscar el usuario actualizado, para enviárselo a la vista "profile"
        let user = await userDao.getByEmail(uid);
        res.render('profile', { user: JSON.parse(JSON.stringify(user)), style: "profile.css" });
        return
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al subir archivos.", error: error.message });
    }
}

const crtl_upload = async (req, res) => {
    try {
        let uid = req.params.uid;
        res.render("upload", {uid: uid})
    } catch (error) {
        console.error(error);
    }
}

//Para la entrega final, genero un controller, que solo devuelva nombre, apellido, correo y rol.
const ctrl_getUsers = async (req, res) => {
    try {
        let users = await userDao.getAll();
        const userDTOs = users.map((user) => new UserDTO(user));
        res.json(userDTOs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener usuarios.", error: error.message });
    }
}

const ctrl_deleteInactiveUsers = async (req, res) => {
    try {
        // Guardo la fecha actual menos 2 días en milisegundos.
        const twoDaysAgo = await dateTwoDaysAgo();
        // Busco todos los usuarios.
        const allUsers = await userDao.getAll();
        // Filtro los usuarios inactivos.
        const inactiveUsers = allUsers.filter((user) => {
        // Convierto la fecha de last_connection al formato de fecha
        const lastConnectionDate = user.last_connection;
        // Devuelvo solo los usuarios que tengan una fecha mayor a dos días
        return lastConnectionDate  < twoDaysAgo;
    });
        // Elimino los usuarios inactivos.
        inactiveUsers.forEach(async (user) => {
            // Envío un correo al usuario antes de eliminar su cuenta.
            const mailOptions = {
            from: 'test email <magulaco@gmail.com>',
            to: user.email,
            subject: 'Eliminación de cuenta por inactividad',
            html: `
            <div>
                <h1>BAJA POR INACTIVIDAD</h1>
                <p>Su cuenta lleva más de 2 días de inactividad</p>
                <p>Su fecha de última conexión fue: ${user.last_connection}</p>
                <p>Fue borrada por el administrador del sitio</p>
            </div>`
            };
            await sendMail(mailOptions);
            // Elimino la cuenta del usuario y su carrito.
            await cartDao.cartDelete(user.cart);
            await userDao.deleteUser(user.email);
            req.logger.info('Usuarios inactivos eliminados y notificados.');
        });
        res.status(200).json({ message: 'Usuarios inactivos eliminados y notificados' });
    } catch (error) {
        console.error('Error al eliminar usuarios inactivos:', error);
    }
}

const crtl_userManager = async (req, res) => {
    try {
        let users = await userDao.getAll();
        // Mapear los usuarios a objetos simples
        const user = users.map((user) => ({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        cart: user.cart,
        last_connection: user.last_connection
        }));
        let domain = config.DOMAIN;
        res.render("userManager", { user, domain, style: "userManager.css"  });
    } catch (error) {
        console.log(error);
    }
}



export {ctrl_changeUserRol, ctrl_upload_Documents, crtl_upload, ctrl_getUsers, ctrl_deleteInactiveUsers, crtl_userManager};