/* sessions_controllers.js */
import { generateAuthToken } from "../utils/jwt.js";
import UserDao from "../DAO/UserDao.js";
import config from "../config/config.js";
import { UserDTOcurrent } from "../DAO/DTOs/user.dto.js";
import { dateAndTime } from "../utils/dateAndTime.js";

const userDao = new UserDao();

const ctrl_GET_Register = async (req, res) => {
    res.render('register', {style:"register.css"});
};

const crtl_POST_Register = async (req, res) => {
    res.render('login');
};

const crtl_GET_Register_error = async (req, res) => {
    res.render('register-error',{});
};

const crtl_GET_Login = async (req, res) => {
    res.redirect('/api/sessions/login');
};

const crtl_POST_Login = async (req, res) => {
    if (!req.user) {
        return res.render("login-error", {});
    }
    if (req.user.email == config.ADMIN_MAIL) {
        req.session.admin = true;
        req.session.user = req.user.email;
        //Agrego al inicio de sesión, un token para para la autenticación de la ruta /current, que usa passport-jwt en vez de session
        const tokenPayload = {
            email: config.ADMIN_MAIL,
            role: "admin" 
        };
        const access_token = generateAuthToken(tokenPayload)
        req.user = {email: config.ADMIN_MAIL}
        res.cookie(config.AUTH_TOKEN, access_token, { httpOnly: true});
        return res.redirect('/products');
    } else {
        let user = await userDao.getByEmail(req.user.email); 
        req.session.user = user.email
        req.session.cart = user.cart
    
        //Guardo la fecha y hora de la última conexión
        user.last_connection = await dateAndTime();
        await user.save();
    
        // Actualizo el token JWT con el campo "role" basado en el rol del usuario en la base de datos, para utilizarlo luego en la creación de productos
        const tokenPayload = {
            email: req.user.email,
            role: user.role
        };
        const access_token = generateAuthToken(tokenPayload)
        res.cookie(config.AUTH_TOKEN, access_token, { httpOnly: true});
        res.cookie('UserID', JSON.stringify(user._id), { maxAge: 12000, httpOnly: true })
        return res.redirect('/products');
    }
};

const crtl_GET_Login_error = async (req, res) => {
    return res.render("login-error");
    };

const crtl_GET_Githubcallback = async(req,res)=>{
//En este caso, devolverá el usuario, así que lo agrego a la sesión.
    const userEmail = typeof req.user === 'string' ? req.user : req.user.email 
    let user = await userDao.getByEmail(userEmail); 
    req.session.user = user.email
    req.session.cart = user.cart

    //Guardo la fecha y hora de la última conexión
    user.last_connection = await dateAndTime();
    await user.save();
    
    const tokenPayload = {
            email: req.user.email,
            role: user.role
        };
    //Agrego al inicio de sesión, un token para para la autenticación de la ruta /current, que usa passport-jwt en vez de session
    const access_token = generateAuthToken(tokenPayload);
    res.cookie(config.AUTH_TOKEN, access_token, { httpOnly: true});
    return res.redirect("/products");
};

const crtl_GET_Profile = async (req, res) => {
    let user = await userDao.getByEmail(req.session.user);
    res.render('profile', {user:JSON.parse(JSON.stringify(user)), style: "profile.css"});
};

const crtl_GET_Logout = async (req, res) => {
    const cookies = req.cookies;
    // Itera a través de las cookies y elimína una por una
    for (const cookieName in cookies) {
        res.clearCookie(cookieName);
    }// Luego, destruye la sesión
    req.session.destroy(err => {
        if (err) {
            return res.json({ status: 'Logout ERROR', body: err });
        };
    });
    res.redirect("/")
};

const crtl_GET_Current = async (req, res) => {
    let user = new UserDTOcurrent(await userDao.getByEmail(req.user.email))
    req.logger.info(user);
    res.render('current', { user: user, message: "Ingresamos mediante Passport-jwt" });
};

export {ctrl_GET_Register, crtl_POST_Register, crtl_GET_Register_error, crtl_GET_Login, crtl_POST_Login, crtl_GET_Login_error, crtl_GET_Githubcallback, crtl_GET_Profile, crtl_GET_Logout, crtl_GET_Current}

