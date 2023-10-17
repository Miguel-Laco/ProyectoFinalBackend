/* services_controllers */
import {sendMail} from "../services/email/email.js"
import UserDao from "../DAO/UserDao.js";
import { isValidPassword } from "../utils/utils.js";
import {generateMailToken} from "../utils/jwt.js"

const userDao = new UserDao();

const ctrl_solicitudChangePassword = async (req, res) => {
    res.render("solicitudChangePassword");
}

const ctrl_changePassword = async (req, res) => {
    res.render("changePassword");
}


const ctrl_POST_resetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    console.log(email);
    console.log(newPassword);
    try {
        // Busco el usuario 
        const user = await userDao.getByEmail(email);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Las contraseñas no coinciden' });
        }
        // Verifico si la nueva contraseña es igual a la anterior usando bcrypt
        if (isValidPassword(user, newPassword)) {
            return res.status(400).json({ error: 'La nueva contraseña no puede ser igual a la contraseña anterior' });
        }

        // Cambiar la contraseña en caso de que esté todo Ok
        const result = await userDao.updatePassword(email, newPassword);

        if (result.status === 'OK') {
            return res.status(200).json({ message: 'Contraseña cambiada exitosamente' });
        } else {
            return res.status(400).json({ error: 'Hubo un error al cambiar la contraseña' });
        }
    } catch (error) {
        console.error("Error en ctrl_POST_resetPassword:", error);
        // Manejar la excepción específica de que la nueva contraseña es igual a la anterior
        if (error.message === 'La nueva contraseña no puede ser la misma que la anterior') {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}


const ctrl_GET_Mail = async (req, res) => {
    let email = req.body.email;
    const resetToken = generateMailToken({ email: email })
    const resetLink = `http://localhost:8080/api/services/changePassword?resetToken=${resetToken}`;
    const mailOptions = {
        from: `test email <magulaco@gmail.com>`,
        to: email,
        subject: "Restablecimiento de contraseña",
        html: `
            <div>
                <h1>Restablecimiento de contraseña</h1>
                <p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>
                <a href="${resetLink}">Restablecer Contraseña</a>
            </div>`,
    };
    try {
        // Envía el correo electrónico con el enlace de restablecimiento
        const result = await sendMail(mailOptions);
        console.log(result);
        res.send(result);
    } catch (error) {
        // Maneja errores si falla el envío del correo electrónico
        console.error(error);
        res.status(500).json({ error: "Error al enviar el correo electrónico" });
    }
}

export  {ctrl_POST_resetPassword, ctrl_GET_Mail, ctrl_changePassword, ctrl_solicitudChangePassword};