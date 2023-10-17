/* jwt */
import jwt from "jsonwebtoken";
import config from "../config/config.js";


const JWT_PRIVATE_KEY = config.JWT_PRIVATE_KEY

export const generateAuthToken = (user) => {
    const token = jwt.sign(user, JWT_PRIVATE_KEY, {expiresIn: "24h"})
    const bearerToken = `Bearer ${token}`; // Agrega el prefijo "Bearer" al token
    return bearerToken;
};


export const generateMailToken = (user) => {
    const token = jwt.sign(user, JWT_PRIVATE_KEY, {expiresIn: "1h"})
    const bearerToken = `Bearer ${token}`; // Agrega el prefijo "Bearer" al token
    return bearerToken;
};

export const generateDataToken = (data) => {
    const token = jwt.sign(data, JWT_PRIVATE_KEY, {expiresIn: "1h"})
    const bearerToken = `Bearer ${token}`; // Agrega el prefijo "Bearer" al token
    return bearerToken;
};



export const authToken = (req, res, next) => {
    const authHeaders = req.cookies.authToken;
    if (!authHeaders) {
        console.log("No authHeaders");
        return res.status(401).send({ error: "Not authorized" });
    }
    const token = authHeaders.split(" ")[1];
    jwt.verify(token, JWT_PRIVATE_KEY, (error, decodedToken) => {
        if (error) {
            console.error("Error:", error);
            if (error.name === "TokenExpiredError") {
                return res.status(401).send({ error: "No autorizado: Token ha expirado" });
            }
            return res.status(403).send({ error: "No autorizado: Token inválido" });
        }
        req.user = decodedToken.user;
        next();
    });
};

//Genero un JWT para validar el token que adjuno al link de recuperación de contraseña
export const mailToken = (req, res, next) => {
    const authHeaders = req.query.resetToken;
    if (!authHeaders) {
        console.log("No authHeaders");
        return res.status(401).send({ error: "Not authorized" });
    }
    const token = authHeaders.split(" ")[1];
    jwt.verify(token, JWT_PRIVATE_KEY, (error, decodedToken) => {
        if (error) {
            console.error("Error:", error);
            if (error.name === "TokenExpiredError") {
                // Token expirado, redirijo a la página de solicitud de cambio de contraseña
                return res.redirect('/api/services/mail'); 
            }
            return res.status(403).send({ error: "No autorizado: Token inválido" });
        }
        req.user = decodedToken.user;
        next();
    });
};

// Genero un JWT para permitir el acceso a usarios "premium" o "admin"
export const requireAdminOrPremium = (req, res, next) => {
    // Tomo el token 
    const authHeader = req.cookies.authToken;
    if (!authHeader) {
    return res.status(401).json({ error: "No autorizado: Token no proporcionado" });
    }
    // Separo el token del encabezado de autorización
    const token = authHeader.split(" ")[1];
    try {
        // Verifico el token
        const decodedToken = jwt.verify(token, JWT_PRIVATE_KEY);
        // Verifico el rol del usuario
        const userRole = decodedToken.role;
        console.log(userRole);
        if (userRole === "admin" || userRole === "premium") {
            // Usuario con rol "admin" o "premium", permitir el acceso
            req.logger.info(`Se valido el acceso a la ruta. User: ${userRole}`)
            next();
        } else {
            return res.status(403).json({ error: "No autorizado: Solo Admin o Premium pueden crear productos" });
        }
    } catch (error) {
        console.error("Error de verificación de token:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "No autorizado: Token ha expirado" });
        }
    return res.status(403).json({ error: "No autorizado: Token inválido" });
    }
};


//Creo un JWT que uso para setear un req.user en una ruta específica que necesito
export const setOwner = (req, res, next) => {
    // Tomo el token 
    const authHeader = req.cookies.authToken;
    if (!authHeader) {
        console.log("No authHeader");
        return res.status(401).send({ error: "Not authorized" });
    }

    // Separo el token del encabezado de autorización
    const token = authHeader.split(" ")[1];
    try {
        // Verifico el token
        const decodedToken = jwt.verify(token, JWT_PRIVATE_KEY);

        // Verifico el rol del usuario
        const userRole = decodedToken.role;

        if (userRole === "admin") {
            req.owner = "admin";
        } else {
            // Usuario normal, establecer owner como el correo del usuario
            req.owner = decodedToken.email;
            req.user = decodedToken;
        }
        console.log(`Owner en requireAuthAndOwner => ${req.owner}`);
        next();
    } catch (error) {
        console.error("Error de verificación de token:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "No autorizado: Token ha expirado" });
        }
        return res.status(403).json({ error: "No autorizado: Token inválido" });
    }
};

// Genero un JWT para permitir el acceso solo al Admin
export const requireAdmin = (req, res, next) => {
    // Tomo el token 
    const authHeader = req.cookies.authToken;
    if (!authHeader) {
    return res.status(401).json({ error: "No autorizado: Token no proporcionado" });
    }
    // Separo el token del encabezado de autorización
    const token = authHeader.split(" ")[1];
    try {
        // Verifico el token
        const decodedToken = jwt.verify(token, JWT_PRIVATE_KEY);
        // Verifico el rol del usuario
        const userRole = decodedToken.role;
        req.logger.info(userRole);
        if (userRole === "admin") {
            // Usuario con rol "admin", permitir el acceso
            req.logger.info(`Se valido el acceso a la ruta. User: ${userRole}`)
            next();
        } else {
            return res.status(403).json({ error: "No autorizado: Solo Admin puede acceder" });
        }
    } catch (error) {
        console.error("Error de verificación de token:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "No autorizado: Token ha expirado" });
        }
    return res.status(403).json({ error: "No autorizado: Token inválido" });
    }
};
