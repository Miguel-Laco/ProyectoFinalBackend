/* info.js */
export const generateProductErrorInfo = product => {
    return `Uno o más parámetros no son válidos:
    - title: necesita recibir un String, recibió: ${product.title}
    - descrption: necesita recibir un String, recibió: ${product.description}
    - code: necesita recibir un String, recibió: ${product.code}
    - price: necesita recibir un Number, recibió: ${product.price}
    - stock: necesita recibir un Number, recibió: ${product.stock}
    - category: necesita recibir un String, recibió: ${product.category}`
}
