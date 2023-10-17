/* upload.js */
import multer from "multer";
import __dirname from "../dirname.js";


// Función para determinar el directorio según el fieldname
const getDirectory = (fieldname) => {
    switch (fieldname) {
        case "profiles":
        return "profiles";
        case "products":
        return "products";
        case "identification":
        case "proofOfAddress":
        case "bankStatement":
        return "documents";
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const directory = getDirectory(file.fieldname); // Obtener el directorio según el fieldname
        const carpeta = `${__dirname}/public/uploads/${directory}`;
    cb(null, carpeta);
    },
    filename: (req, file, cb) => {
        console.log(file);
        const ext = file.originalname.split(".")[1];
        const { uid } = req.params; // Obtener uid de la solicitud
        const filename = `${uid}-${file.fieldname}.${ext}`;
        cb(null, filename);
    }
})
const upload = multer({storage});




export default upload

