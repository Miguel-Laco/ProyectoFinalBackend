/* utils.js */
import bcrypt from "bcrypt";


//Utilizo bcrypt para encriptar el password que se almacenará en DB
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

//Creo una función que permite validar el password ingresado por el usuario, contra el almacenado encriptado.
export const isValidPassword = (user, password) => {
    const result =  bcrypt.compareSync(password, user.password);
    console.log(`Comparando contraseñas: ${result}`);
    return result
};


