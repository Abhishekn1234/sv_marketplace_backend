"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.generateOtp = void 0;
const User_1 = require("../../../../features/Auth/Models/User");
const sendOtp_1 = require("../../../../utils/Sendotp/sendOtp");
const generateOtp = async (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
        throw new Error("Invalid email format");
    const user = await User_1.User.findOne({ email });
    if (!user)
        throw new Error("User not found");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();
    await (0, sendOtp_1.sendOtp)(email, otp);
    return { success: true, message: "OTP sent to email" };
};
exports.generateOtp = generateOtp;
const verifyOtp = async (email, otp) => {
    const user = await User_1.User.findOne({ email });
    if (!user)
        throw new Error("User not found");
    if (!user.otp || !user.otpExpire)
        throw new Error("OTP not generated");
    if (user.otp !== otp)
        throw new Error("Invalid OTP");
    if (user.otpExpire < new Date())
        throw new Error("OTP expired");
    user.otp = "";
    user.otpExpire = new Date();
    user.isVerified = true;
    await user.save();
    return { success: true, message: "OTP verified successfully" };
};
exports.verifyOtp = verifyOtp;
//# sourceMappingURL=otp.service.js.map