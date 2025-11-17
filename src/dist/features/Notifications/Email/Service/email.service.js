"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordService = exports.forgotPasswordService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../../../Auth/Models/User");
const sendEmail_1 = require("../../../../utils/Sendemail/sendEmail");
const forgotPasswordService = async (email) => {
    const user = await User_1.User.findOne({ email });
    if (!user)
        throw new Error("User not found");
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto_1.default.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const html = `
    <h2>Password Reset Request</h2>
    <p>Hello ${user.fullName}, click the button below to reset your password:</p>
    <a href="${resetUrl}" style="background:#007bff;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Reset Password</a>
    <p>This link expires in 1 hour.</p>
  `;
    await (0, sendEmail_1.sendEmail)(user.email, "Reset Your Password", html);
    return { success: true, message: "Password reset link sent to your email." };
};
exports.forgotPasswordService = forgotPasswordService;
const resetPasswordService = async (token, password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new Error("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
    }
    const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    const user = await User_1.User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: new Date() },
    });
    if (!user)
        throw new Error("Invalid or expired token");
    user.password = password;
    user.resetPasswordToken = "";
    user.resetPasswordExpire = undefined;
    await user.save();
    const html = `
    <h2>Password Reset Successful</h2>
    <p>Hello ${user.fullName}, your password has been reset successfully.</p>
    <p>If you did not request this change, please contact support immediately.</p>
  `;
    await (0, sendEmail_1.sendEmail)(user.email, "Your Password Has Been Reset", html);
    return { success: true, message: "Password reset successful and confirmation email sent." };
};
exports.resetPasswordService = resetPasswordService;
//# sourceMappingURL=email.service.js.map