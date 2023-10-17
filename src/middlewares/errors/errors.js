/* errors.js */
import EErrors from "../../services/errors/enums.js";

export default (error, req, res, next) => {
    error.stack = '';
    req.logger.error(error.cause); // Registra el error en la consola si es necesario

    switch (error.code) {
        case EErrors.INVALID_TYPES:
            res.status(400).json({ status: "error", error: error.name, cause: error.cause });
            break;

        case EErrors.INVALID_PARAM:
            res.status(400).json({ status: "error", error: error.name, cause: error.cause });
            break;

        default:
            res.status(500).json({ status: "error", error: "Unhandled Error" });
    }
}

