/* dateAndTime.js */

//Genero una función que devuelve la fecha y hora
export const dateAndTime = async () => {
    const timestamp = Date.now(); // Obtener la marca de tiempo actual en milisegundos
    const fechaLegible = new Date(timestamp); // Crear un objeto Date a partir de la marca de tiempo
    const fechaFormateada = fechaLegible.toLocaleString(); // Formatear la fecha a una cadena legible
    return fechaFormateada
}

//Genero una función que devuelve la fecha y hora de hace dos días
export const dateTwoDaysAgo = async () => {
    const timestamp = Date.now() - 2 * 24 * 60 * 60 * 1000; // Obtener la marca de tiempo actual en milisegundos
    const fechaLegible = new Date(timestamp); // Crear un objeto Date a partir de la marca de tiempo
    const fechaFormateada = fechaLegible.toLocaleString(); // Formatear la fecha a una cadena legible
    return fechaFormateada
}
