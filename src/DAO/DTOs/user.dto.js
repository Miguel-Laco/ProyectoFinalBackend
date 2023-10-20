/* user.dto.js */


//Genero un DTO para enviar el listado de usuarios en la ruta api/users/
export class UserDTO{
    constructor(user){
        this.first_name = user.first_name,
        this.last_name = user.last_name,
        this.email = user.email
        this.role = user.role
    }
}

export class UserDTOgithub {
    constructor(fullName, userMail) {
        const words = fullName.split(" ");
        this.first_name = words[0];
        this.last_name = words.slice(1).join(" ");
        this.age = 0; // Campo que no trae el perfil
        this.email = userMail;
        this.password = ""; // Al ser autenticación de terceros, no asigno un password
        this.cart = null; // Dejar este campo en null o asignar cart._id según tu lógica
    }
}