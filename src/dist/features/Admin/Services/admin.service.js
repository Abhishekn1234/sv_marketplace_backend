"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminVerifyUserService = exports.adminDeleteUserService = exports.adminEditUserService = exports.adminCreateUserService = exports.registerAdminService = void 0;
const User_1 = require("../../Auth/Models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tokenUtils_1 = require("../../../utils/Auth_token/tokenUtils");
const validator_1 = require("../../../utils/validations/Admin/validator");
const registerAdminService = async (fullName, email, phone, password) => {
    (0, validator_1.validateUserInput)(fullName, email, phone, password);
    const exists = await User_1.User.findOne({ $or: [{ email }, { phone }] });
    if (exists)
        throw new Error("Admin already exists");
    const user = await User_1.User.create({
        fullName,
        email,
        phone,
        password,
        role: "admin",
    });
    const accessToken = (0, tokenUtils_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, tokenUtils_1.generateRefreshToken)(user.id, user.role);
    await user.save();
    return { user, accessToken, refreshToken };
};
exports.registerAdminService = registerAdminService;
const adminCreateUserService = async (fullName, email, phone, password, role) => {
    if (!["customer", "employee", "coordinator"].includes(role))
        throw new Error("Invalid role or cannot create admin");
    (0, validator_1.validateUserInput)(fullName, email, phone, password);
    const exists = await User_1.User.findOne({ $or: [{ email }, { phone }] });
    if (exists)
        throw new Error("User already exists");
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.User.create({
        fullName,
        email,
        phone,
        password: hashedPassword,
        role,
    });
    return { success: true, message: "User created successfully", data: user };
};
exports.adminCreateUserService = adminCreateUserService;
const adminEditUserService = async (userId, updates) => {
    const allowedFields = ["fullName", "email", "phone", "role", "isVerified"];
    const filteredUpdates = {};
    for (const key of allowedFields) {
        if (updates[key] !== undefined)
            filteredUpdates[key] = updates[key];
    }
    const updatedUser = await User_1.User.findByIdAndUpdate(userId, filteredUpdates, {
        new: true,
    });
    if (!updatedUser)
        throw new Error("User not found");
    return { message: "User updated successfully", user: updatedUser };
};
exports.adminEditUserService = adminEditUserService;
const adminDeleteUserService = async (userId) => {
    const deletedUser = await User_1.User.findByIdAndDelete(userId);
    if (!deletedUser)
        throw new Error("User not found");
    return { message: "User deleted successfully" };
};
exports.adminDeleteUserService = adminDeleteUserService;
const adminVerifyUserService = async (userId) => {
    const user = await User_1.User.findById(userId);
    if (!user)
        throw new Error("User not found");
    user.isVerified = true;
    await user.save();
    return {
        message: `${user.fullName || "User"} has been verified successfully`,
        user,
    };
};
exports.adminVerifyUserService = adminVerifyUserService;
//# sourceMappingURL=admin.service.js.map