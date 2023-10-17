/* swagger-options.js */
export const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Documentación de mi Proyecto",
            description: "Documentación de los módulos de Carts y Products"
        }
    },
    apis: [`./src/docs/**/*.yaml`]
}