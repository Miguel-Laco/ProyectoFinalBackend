/* session.js */
import { Router } from "express";
import {authLogout} from "../middlewares/auth.js";
import passport from "passport";
import {
    ctrl_GET_Register, 
    crtl_POST_Register, 
    crtl_GET_Register_error, 
    crtl_GET_Login, 
    crtl_POST_Login, 
    crtl_GET_Login_error, 
    crtl_GET_Githubcallback, 
    crtl_GET_Profile, 
    crtl_GET_Logout
} from "../controllers/sessions_controllers.js"
import { authToken } from "../utils/jwt.js";


const sessionRouter = Router();


sessionRouter.get('/register', authLogout, ctrl_GET_Register);

sessionRouter.post('/register', passport.authenticate("register", {failureRedirect: "/api/sessions/register-error"}), crtl_POST_Register);

sessionRouter.get('/register-error', crtl_GET_Register_error);

sessionRouter.get('/login', authLogout, crtl_GET_Login);

sessionRouter.post('/login', passport.authenticate("login", {failureRedirect: "/api/sessions/login-error"}) ,crtl_POST_Login)

sessionRouter.get('/login-error', crtl_GET_Login_error);

sessionRouter.get("/github",passport.authenticate("github", {scope:["user:email"]}), async(req,res)=>{})

sessionRouter.get("/githubcallback",passport.authenticate("github", {failureRedirect:"/api/sessions/login-error"}), crtl_GET_Githubcallback)

sessionRouter.get('/profile', authToken, crtl_GET_Profile);

sessionRouter.get('/logout', crtl_GET_Logout);


export default sessionRouter;