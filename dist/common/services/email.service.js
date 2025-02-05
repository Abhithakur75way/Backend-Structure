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
exports.resetPasswordEmailTemplate = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const http_errors_1 = __importDefault(require("http-errors"));
const config_helper_1 = require("../helper/config.helper");
(0, config_helper_1.loadConfig)();
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
const sendEmail = (mailOptions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        (0, http_errors_1.default)(500, { message: error.message });
    }
});
exports.sendEmail = sendEmail;
const resetPasswordEmailTemplate = (token = "") => `
<html>
  <body>
    <h3>Welcome to app</h3>
    <p>Click <a href="${process.env.FE_BASE_URL}/reset-password?token=${token}">here</a> to reset your password</p>
  </body>
</html>`;
exports.resetPasswordEmailTemplate = resetPasswordEmailTemplate;
