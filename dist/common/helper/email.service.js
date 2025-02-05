"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, subject, html }) {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail", // Use a reliable email service (e.g., Gmail, SMTP)
            auth: {
                user: process.env.SMTP_USER, // Your email address
                pass: process.env.SMTP_PASS, // Your email password or App Password
            },
        });
        const mailOptions = {
            from: `"Job Huntly" <${process.env.SMTP_USER}>`, // Sender name and email
            to: email,
            subject: subject,
            html: html,
        };
        const info = yield transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
        return info;
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email could not be sent");
    }
});
exports.sendEmail = sendEmail;
