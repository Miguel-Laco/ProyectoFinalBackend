/* passport.config.js */
import passport from "passport";
import local from "passport-local";
import GithubStrategy from "passport-github2";
import UserDao from "../DAO/UserDao.js";
import { isValidPassword, createHash, cookieExtrator } from "../utils/utils.js";
import jwt from "passport-jwt";
import config from "./config.js";
import CartDao from "../DAO/CartDao.js"
import { logger } from "../utils/logger.js";
import { UserDTOgithub } from "../DAO/DTOs/user.dto.js";

const cartManager = new CartDao();
const LocalStrategy = local.Strategy;
const userDao = new UserDao();
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const initializePassport = () => {

passport.use("register", new LocalStrategy(
    {passReqToCallback:true, usernameField:"email"}, async (req,username,password,done)=>{
        try {
            let user = req.body; //Levanto la información del body
            let userFound = await userDao.getByEmail(user.email); //Valido si el mail, existe en la DB
            if(userFound){
                //Si existe en la DB, devuelvo un error avisando que ya existe.
                req.logger.warning("User already exists");
                return done(null,false);
            }else{
                //Si no existe, creo el usuario y redirijo a Login
                user.password = createHash(password)
                let result = await userDao.createUser(user)
                req.logger.info(result);
                return done(null, result);
            }
        } catch (error) {
            console.error("Error en el registro:", error);
            return done(null, false); // Autenticación fallida debido a un error

        }
    }))


    passport.use("login", new LocalStrategy({usernameField: "email"}, async (username, password, done) => {
        try {
            // Validar si el usuario ingresado es el Admin
            if (username === config.ADMIN_MAIL && password === config.ADMIN_PASSWORD) {
                return done(null, { email: username });
            }
            
            // Si no es el admin, busco en la DB el usuario
            let result = await userDao.getByEmail(username);
            
            if (!result || !isValidPassword(result, password) || username !== result.email) {
                return done(null, false);
            }
            // Actualizar la asignación de req.session.user a username
            return done(null, { email: username });
        } catch (error) {
            return done(error);
        }
    }));

    passport.use("github", new GithubStrategy({
        clientID: config.GITHUB_CLIENT_ID,
        clientSecret: config.GITHUB_API_KEY,
        callbackURL: config.GITHUB_CALLBACK_URL,
        scope:[config.GITHUB_SCOPE]
    }, async (accessToken,refreshToken,profile,done)=>{
        try {
            let userMail = profile.emails[0].value;
            let user = await userDao.getByEmail(userMail);
            if (!user.cart) {
                let cart = await cartManager.addCarts();
                return cart
            }
            const fullName = profile._json.name; //Almaceno en una variable el nombre completo
            if (!user) { //Si no existe el usuario en la DB, lo creo y lo agrego
                const userDTO = new UserDTOgithub(fullName, userMail);
                let result = await userDao.createUser(userDTO);
                done(null, result);
            }else{
                //Si entra acá, es porque ya existe el usuario
                done(null,user);
            }
        } catch (error) {
            return done(error)
        }
    }
    ))

    passport.use("current", new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtrator]),
        secretOrKey: config.JWT_PRIVATE_KEY,
    }, async (jwt_payload, done) => {
        try {
            logger.info("Token verificado correctamente", jwt_payload);
            return done(null, jwt_payload);
        } catch (error) {
            logger.error("Error al verificar el token:", error);
            return done(error);
        }
    }))
    

passport.serializeUser((user, done) => {
      done(null, user.email); // Utilizar el correo electrónico como identificador único
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      let user = await userDao.getById(id);
      done(null, user); // Agrega esta línea para pasar el usuario encontrado
    } catch (error) {
      done(error); // Agrega esta línea para pasar cualquier error
    }
  });

}

export default initializePassport;