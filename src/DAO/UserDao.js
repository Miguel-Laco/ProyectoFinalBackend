/* UserDao.js */
import { usersModel } from "./model/users.model.js";
import CartDao from "./CartDao.js";
import { logger } from "../utils/logger.js";
import { createHash } from "../utils/utils.js";

const cartManager = new CartDao();

class UserDao {
  constructor() {
    this.model = usersModel;
  }

  async getAll() {
    try {
      let result = await usersModel.find()
      return result
    } catch (error) {
      logger.warning(`Error al buscar la lista de ususarios`);
      throw error;
    }
  }

  async getByEmail(email) {
    try {
      let result = await usersModel.findOne({ email: email });
      return result;
    } catch (error) {
      logger.warning(`Error al buscar el usuario con el correo: ${email}`);
      return error;
    }
  }

  async createUser(user) {
    try {
      let cart = await cartManager.addCarts();
      logger.info("LOG DE CART" + cart);
      let newUser = {
        first_name: user.first_name, // Tomar el nombre del usuario del cuerpo de la solicitud
        last_name: user.last_name, // Tomar el apellido del usuario del cuerpo de la solicitud
        age: user.age, // Campo que no trae el perfil
        email: user.email, // Tomar el email del usuario del cuerpo de la solicitud
        password: user.password, // Tomar la contraseña del usuario del cuerpo de la solicitud y hashearla
        cart: cart._id, // Asignar un carrito vacío al nuevo usuario
        role: user.role || "user"
      };
      let result = await usersModel.create(newUser);
      return result;
    } catch (error) {
      return { status: "Error", msg: `No pudo crearse el usuario ${user}` };
    }
  }

  async getById(uid) {
    try {
      let result = await usersModel.findOne({_id: uid});
      return result;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  async updatePassword(email, newPassword) {
    try {
      const user = await this.getByEmail(email);

      if (!user) {
        return { status: "Error", msg: "Usuario no encontrado" };
      }

      // Hashea la nueva contraseña
      const hashedNewPassword = createHash(newPassword);

      // Compara si la nueva contraseña es igual a la contraseña actual
      if (hashedNewPassword === user.password) {
        return { status: "Error", msg: "La nueva contraseña no puede ser la misma que la anterior" };
      }

      // Actualiza la contraseña del usuario con la nueva contraseña hasheada
      user.password = hashedNewPassword;
      await user.save();

      return { status: "OK", msg: "Contraseña actualizada correctamente" };
    } catch (error) {
      return { status: "Error", msg: `Error al actualizar la contraseña: ${error.message}` };
    }
  }

  async deleteUser (email){
    try {
        logger.info(`El id del usuario a eliminar es ${email}`);
        await usersModel.deleteOne({email: email}); //Busco la lista
        return {status:"Success", msg:`Su usuario ID: ${email}, fue eliminado`}
    } catch (error) {
        return{status:"Error", msg:`Su Usuario ID: ${email}, no existe`};
    }
}

async updateDocuments (uid, files){
  try {
      const user = await this.getById(uid);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
      const uploadedDocuments = files.map((file) => ({
        name: `${file.fieldname}-${file.originalname}`,     // Nombre del documento
        reference: file.path         // Ruta donde se almacena el documento
      }));
      // Agrega los documentos subidos al usuario
      user.documents.push(...uploadedDocuments);
      // Guarda los cambios en el usuario
      await user.save();
      return {status:"Ok", msg:`Documentos actualizados`}
  } catch (error) {
    return{status:"Error", msg:`Su Usuario ID: ${email}, no existe`};
  }
}

async changeRol (email) { 
  try {
    let user = await this.getByEmail(email);
    user.role === "user" ? user.role = "premium" : user.role = "user";
    await user.save();
    req.logger.info(`Se cambió el rol de ${user.email} a: ${user.role}`)
  } catch (error) {
    return{status:"Error", msg:`Su Usuario ID: ${email}, no existe`};
  }
}


}

export default UserDao;
