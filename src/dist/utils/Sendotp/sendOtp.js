"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
transporter.verify()
    .then(() => console.log("✅ SMTP ready (SSL 465)"))
    .catch(err => console.error("❌ SMTP connection failed:", err));
const sendOtp = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: "Your OTP Code",
            html: `<p>Your OTP code is: <b>${otp}</b>. It expires in 10 minutes.</p>`,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("OTP sent:", info.messageId);
    }
    catch (err) {
        console.error("Failed to send OTP:", err);
        throw new Error("Could not send OTP");
    }
};
exports.sendOtp = sendOtp;
//# sourceMappingURL=sendOtp.js.map