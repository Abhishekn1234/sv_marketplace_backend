"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (to, subject, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Email credentials not configured");
    }
    console.log("Attempting to send email with:", process.env.EMAIL_USER);
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    try {
        await transporter.verify();
        console.log("Email transporter verified successfully");
    }
    catch (error) {
        console.error("Transporter verification failed:", error);
        throw error;
    }
    const mailOptions = {
        from: `"Support" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return info;
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map