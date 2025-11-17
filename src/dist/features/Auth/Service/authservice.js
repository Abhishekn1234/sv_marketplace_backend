"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialLoginService = exports.refreshTokenService = exports.getProfileService = exports.changePasswords = exports.updateBio = exports.logOutService = exports.loginUserService = exports.registerUserService = void 0;
const axios_1 = __importDefault(require("axios"));
const User_1 = require("../../Auth/Models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validators_1 = require("../../../utils/validations/User_Employee/validators");
const tokenUtils_1 = require("../../../utils/Auth_token/tokenUtils");
const registerUserService = async (fullName, email, phone, password, role) => {
    if (!["customer", "employee"].includes(role))
        throw new Error("Invalid role for self-registration");
    (0, validators_1.validateRegistrationInputs)(email, phone, password);
    const existingUser = await User_1.User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser)
        throw new Error("User already exists");
    const user = await User_1.User.create({ fullName, email, phone, password, role });
    const accessToken = (0, tokenUtils_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, tokenUtils_1.generateRefreshToken)(user.id, user.role);
    return {
        success: true,
        message: "User registered successfully",
        data: { user, accessToken, refreshToken },
    };
};
exports.registerUserService = registerUserService;
const loginUserService = async (identifier, password) => {
    if (!validators_1.emailRegex.test(identifier) && !validators_1.phoneRegex.test(identifier))
        throw new Error("Invalid email or phone format");
    const user = await User_1.User.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user)
        throw new Error("User not found");
    const isMatch = await user.matchPassword(password);
    if (!isMatch)
        throw new Error("Invalid credentials");
    const accessToken = (0, tokenUtils_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, tokenUtils_1.generateRefreshToken)(user.id, user.role);
    user.LoginDate = new Date();
    user.LoginTime = new Date().toLocaleTimeString();
    await user.save();
    const { password: _, otp, otpExpire, __v, emailVerificationToken, resetPasswordToken, resetPasswordExpire, LoginDate, LoginTime, LogoutDate, LogoutTime, duration, ...userData } = user.toObject();
    return { ...userData, accessToken, refreshToken };
};
exports.loginUserService = loginUserService;
const logOutService = async (userId) => {
    const user = await User_1.User.findById(userId);
    if (!user)
        throw new Error("User not found");
    const now = new Date();
    user.LogoutDate = now;
    user.LogoutTime = now.toLocaleTimeString();
    const loginTime = new Date(user.LoginDate).getTime();
    const logoutTime = now.getTime();
    const diffMs = Math.abs(logoutTime - loginTime);
    const diffMinutes = (diffMs / 60000).toFixed(2);
    const diffSeconds = Math.floor(diffMs / 1000);
    user.duration = `${diffMinutes} minutes (${diffSeconds} seconds)`;
    await user.save();
    return { message: "Logged out!" };
};
exports.logOutService = logOutService;
const updateBio = async (userId, data) => {
    const allowedFields = [
        "fullName",
        "phone",
        "nationality",
        "dob",
        "address",
        "bio",
        "profilePictureUrl",
    ];
    const updates = {};
    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            updates[key] = key === "dob" ? new Date(data[key]) : data[key];
        }
    }
    return await User_1.User.findByIdAndUpdate(userId, { $set: updates }, { new: true })
        .select("-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire -emailVerificationToken -__v -accessToken -refreshToken -LoginDate -LoginTime -LogoutDate -LogoutTime -duration");
};
exports.updateBio = updateBio;
const changePasswords = async (userId, currentPassword, newPassword) => {
    const user = await User_1.User.findById(userId);
    if (!user)
        throw new Error("User not found");
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
        throw new Error("Current password is incorrect");
    if (!validators_1.strongPasswordRegex.test(newPassword))
        throw new Error("Password must be 8+ characters, include upper/lowercase, number & special character");
    user.password = newPassword;
    await user.save();
    return { success: true, message: "Password updated successfully" };
};
exports.changePasswords = changePasswords;
const getProfileService = async (userId) => {
    const user = await User_1.User.findById(userId).select("-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire -accessToken -refreshToken -__v");
    if (!user)
        throw new Error("User not found");
    return user.toObject();
};
exports.getProfileService = getProfileService;
const refreshTokenService = async (refreshToken) => {
    if (!refreshToken)
        throw new Error("No refresh token provided");
    const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User_1.User.findById(payload.id);
    if (!user)
        throw new Error("User not found");
    return {
        accessToken: (0, tokenUtils_1.generateAccessToken)(user.id, user.role),
        refreshToken: (0, tokenUtils_1.generateRefreshToken)(user.id, user.role),
    };
};
exports.refreshTokenService = refreshTokenService;
const socialLoginService = async (provider, token, role) => {
    let socialId = "";
    if (provider === "google") {
        const { data } = await axios_1.default.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        socialId = data.sub;
    }
    if (provider === "facebook") {
        const { data } = await axios_1.default.get(`https://graph.facebook.com/me?access_token=${token}`);
        socialId = data.id;
    }
    let user = await User_1.User.findOne({ "social.socialId": socialId });
    if (!user) {
        user = await User_1.User.create({
            role,
            social: { provider, socialId },
            fullName: "Social User",
            email: "",
            phone: "",
            password: "",
        });
    }
    const accessToken = (0, tokenUtils_1.generateAccessToken)(user.id, user.role);
    return {
        success: true,
        message: "Social login successful",
        data: { user, accessToken },
    };
};
exports.socialLoginService = socialLoginService;
//# sourceMappingURL=authservice.js.map