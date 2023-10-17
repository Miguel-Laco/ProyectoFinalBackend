/* logger.js */

import winston from "winston";
import config from "../config/config.js";

//Defino los niveles y colores predeterminados para mi logger
const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: "red",
        error: "magenta",
        warning: "yellow",
        info: "blue",
        http: "green",
        debug: "grey"
    }
}


//Genero una función con la configuración para el entorno de desarrollo
const buildDevLogger =() =>{
    const logger = winston.createLogger({
        levels: customLevelsOptions.levels,
        transports: [
            new winston.transports.Console({ 
                level: "debug", //defino que se muestre en consola desde debug hacia arriba
                format:winston.format.combine(
                    winston.format.colorize({colors:customLevelsOptions.colors}),
                    winston.format.simple()
                )
            }),
            new winston.transports.File({
                filename: `./errors.log`, //defino un archivo donde quiero almacenar algún log
                 level: `error`,    //defino desde que nivel quiero registrar en el archivo
                format: winston.format.simple()
            })
        ]
    })
    return logger;
}

//Genero una función con la configuración para el entorno de producción
const buildPordLogger = () => {
    const logger = winston.createLogger({
        levels: customLevelsOptions.levels,
        transports: [
            new winston.transports.Console({ 
                level: "info", //defino que se muestre en consola desde info hacia arriba
                format:winston.format.combine(
                    winston.format.colorize({colors:customLevelsOptions.colors}),
                    winston.format.simple()
                )
            }),
            new winston.transports.File({
                filename: `./errors.log`, //defino un archivo donde quiero almacenar algún log
                 level: `error`,    //defino desde que nivel quiero registrar en el archivo
                format: winston.format.simple()
            })
        ]
    })
    return logger;
}

export let logger;

//defino un condicional que valida si el entorno es desarrollo o producción
if (config.ENVIROMENT === "desarrollo") {
    logger = buildDevLogger();
    logger.info(`Logger seteado en ${config.ENVIROMENT}`)
}else{
    logger = buildPordLogger();
    logger.info(`Logger seteado en ${config.ENVIROMENT}`)
}



export const addLogger = (req, res, next) => {
    req.logger = logger; //guardo en req.logger mi logger

    //genero un nuevo objeto que voy a utilizar para mostrar gráficamente en handlebars, como está configurado mi logger
    req.logger.metadata = {
        enviroment: config.ENVIROMENT,
        transports: logger.transports.map(transport => ({
            name: transport.name,
            level: transport.level
        })),
    };

    
    //Genero un primer log, para http, que indica la ruta y la hora
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString()}`);
    next();
}