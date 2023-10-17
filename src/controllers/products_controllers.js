/* products.controllers */
import ProductDao from "../DAO/ProductDao.js";
import UserDao from "../DAO/UserDao.js";
import { sendMail } from "../services/email/email.js";
import CustomError from "../services/errors/CustomErrors.js";
import EErrors from "../services/errors/enums.js";
import {generateProductErrorInfo} from "../services/errors/info.js";

const productDao = new ProductDao(); //Inicializo la clase
const userDao = new UserDao();

const crtl_GET_Products = async (req, res) => {
    try {
        let {limit} = req.query;
        let products = await productDao.getProducts();
        let response = limit ? products.slice(0, limit) : products
        res.send(response);
    } catch (error) {
        res.status(404).send({status: "error", error});
    }
};

const crtl_GET_ProductId = async (req, res) => {
    try {
        let id = req.params.pid;
        let response = await productDao.getProductsById(id);
        if (response) {
            res.send(response);
        }else {
            res.status(400).send({status: "error", msg: `Error con el ${id}, no existe`});
        }
    } catch (error) {
        res.status(404).send({status: "error", error});
    }
};

const crtl_POST_Products = async (req, res) => {
    try {
        let product = req.body;
        if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category){
            CustomError.createError({
                name: "Error al crear el producto",
                cause: generateProductErrorInfo(product),
                message: "Error al intentar crear el producto",
                code: EErrors.INVALID_PARAM
            });
        }
        const owner = req.owner; // Utiliza req.owner para obtener el propietari
        console.log(product.thumbnail);
        await productDao.addProduct(product.title, product.description, product.code, product.price, product.stock, product.category, product.thumbnail, owner);
        res.redirect('/products?page=1&limit=30')
    } catch (error) {
    res.status(400).json({ status: 'error', error: error.message });
    }
    };

const crtl_PUT_ProductId = async (req, res) => {
    try {
        let id = req.params.id;
        let campos = req.body;
        // Verifico si el usuario es un administrador
        if (req.owner === "admin") {
            // Si es admin, permite la modificación sin importar quién sea el propietario
            req.logger.info(`Usted es ${req.owner} y modificó ${JSON.stringify(campos)} del ID: ${id}`)
            res.send(await productDao.updateProduct(id, campos));
        } else {
            // Si no es admin, verificao si el producto pertenece al usuario premium
            const product = await productDao.getProductsById(id);
            if (!product) {
                return res.status(404).send({ status: "error", msg: `El producto con ID ${id} no existe` });
            }
            if (product.owner === req.owner && req.user.role === "premium") {
                // Si el producto pertenece al usuario premium, permite la modificación
                req.logger.info(`Usted es ${req.owner} y modificó ${JSON.stringify(campos)} del ID: ${id}`)
                res.send(await productDao.updateProduct(id, campos));
            } else {
                req.logger.info("Solo el Admin o el usuario Premium owner del producto puede modificarlo")
                // Si el producto no pertenece al usuario premium o el usuario no es premium, no tiene permisos para modificarlo
                return res.status(403).send({ status: "error", msg: "No tienes permisos para modificar este producto" });
            }
        }
    } catch (error) {
        req.logger.error(error);
    }
};

const crtl_DEL_ProductId = async (req, res) => {
    try {
        let id = req.params.pid;
        const product = await productDao.getProductsById(id);
        if (!product) {
            return res.status(404).send({ status: "error", msg: `El producto con ID ${id} no existe` });
        }
         // Verifico si el usuario es un administrador
        if (req.owner === "admin") {
            // Si es admin, permite la modificación sin importar quién sea el propietario
            req.logger.info(`Usted es ${req.owner} y eliminó ID: ${id}`);
            if (!product.owner) {
                //Si no existe owner, es parte de la base de datos inicial
                res.send(await productDao.deleteProduct(id));
            }
            if (product.owner != "admin") {
                // Si el ususario no es Admin, busco el dueño y valido si el usuario es premium
                // Entonces envío un correo avisando que su producto fue eliminado por el admin
                let user = await userDao.getByEmail(product.owner);
                if (!user) {
                    req.logger.info(`El usuario ${user}, ya no existe en la base de datos y no será notificado por la eliminación de su producto`);
                    res.send(await productDao.deleteProduct(id));
                }else if (user.role === "premium"){
                    const mailOptions = {
                        from: 'test email <magulaco@gmail.com>',
                        to: user.email,
                        subject: 'Eliminación de producto',
                        html: `
                        <div>
                            <h1>PRODUCTO ELIMINADO</h1>
                            <p>Su producto fue eliminado por un administrador</p>
                            <p>El producto eliminiado fue: ${product.title}</p>
                        </div>`
                        };
                        await sendMail(mailOptions);
                        res.send(await productDao.deleteProduct(id));
                }else{
                    //Si el role es user, se elimina sin comunicar.
                    res.send(await productDao.deleteProduct(id));
                }
            }else{
                //Si no cumple con las anteriores, es creado por el admin
                res.send(await productDao.deleteProduct(id));
            }
            
        } else {
            // Si no es admin, verificao si el producto pertenece al usuario premium
            if (product.owner === req.owner && req.user.role === "premium") {
                // Si el producto pertenece al usuario premium, permite la modificación
                req.logger.info(`Usted es ${req.owner} y eliminó ID: ${id}`)
                res.send(await productDao.deleteProduct(id));
            } else {
                req.logger.info("El Admin puede borrar cualquiera y el Premium solo los suyos")
                req.logger.info(`Usted es ${req.owner} y el producto es de ${product.owner}`)
                // Si el producto no pertenece al usuario premium o el usuario no es premium, no tiene permisos para modificarlo
                return res.status(403).send({ status: "error", msg: "No tienes permisos para modificar este producto" });
            }
        }
        
    } catch (error) {
        req.logger.error(error);
    }
};

export {crtl_DEL_ProductId, crtl_GET_ProductId, crtl_GET_Products, crtl_POST_Products, crtl_PUT_ProductId}