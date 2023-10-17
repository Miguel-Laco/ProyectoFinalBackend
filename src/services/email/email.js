/* email.js */
import nodemailer from "nodemailer";
import config from "../../config/config.js";

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: config.GMAIL_USER,
        pass: config.GMAIL_PASS
    }
});

export const sendMail = async options => {
    let result = await transport.sendMail(options);
    return result;
}