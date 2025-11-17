"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminVerifyUser = exports.adminDeleteUser = exports.adminEditUser = exports.resetPassword = exports.forgotPassword = exports.verifyOtpController = exports.sendOtpController = exports.socialLogin = exports.loginUser = exports.adminCreateUser = exports.registerCoordinator = exports.registerAdmin = exports.Accesstoken = exports.getProfileController = exports.changePassword = exports.submitBio = exports.logoutUser = exports.registerUser = void 0;
const authservice_1 = require("../Service/authservice");
const otp_service_1 = require("../../Notifications/Otp/Service/otp.service");
const coordinator_service_1 = require("../../Coordinator/Services/coordinator.service");
const email_service_1 = require("../../Notifications/Email/Service/email.service");
const admin_service_1 = require("../../Admin/Services/admin.service");
const User_1 = require("../Models/User");
const cloudinary_1 = __importDefault(require("../../../config/cloudinary"));
const registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, password, role } = req.body;
        const data = await (0, authservice_1.registerUserService)(fullName, email, phone, password, role);
        res.status(201).json(data);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.registerUser = registerUser;
const logoutUser = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const result = await (0, authservice_1.logOutService)(userId);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.logoutUser = logoutUser;
const submitBio = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { fullName, phone, nationality, dob, address, bio } = req.body;
        let newImageUrl;
        let newPublicId;
        // If user uploaded a new file
        if (req.file) {
            newImageUrl = req.file.path;
            newPublicId = req.file.filename; // Cloudinary public_id
            // Find user
            const user = await User_1.User.findById(userId);
            // Delete old profile image from Cloudinary
            if (user?.profilePicturePublicId) {
                await cloudinary_1.default.uploader.destroy(user.profilePicturePublicId);
            }
        }
        const updatedUser = await (0, authservice_1.updateBio)(userId, {
            fullName,
            phone,
            nationality,
            dob,
            address,
            bio,
            ...(newImageUrl && { profilePictureUrl: newImageUrl }),
            ...(newPublicId && { profilePicturePublicId: newPublicId }),
        });
        res.status(200).json(updatedUser);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.submitBio = submitBio;
const changePassword = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { currentPassword, newPassword } = req.body;
        const result = await (0, authservice_1.changePasswords)(userId, currentPassword, newPassword);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.changePassword = changePassword;
const getProfileController = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const result = await (0, authservice_1.getProfileService)(userId);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
exports.getProfileController = getProfileController;
const Accesstoken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const data = await (0, authservice_1.refreshTokenService)(refreshToken);
        res.json(data);
    }
    catch (err) {
        res.status(401).json({ error: err.message });
    }
};
exports.Accesstoken = Accesstoken;
const registerAdmin = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;
        const user = await (0, admin_service_1.registerAdminService)(fullName, email, phone, password);
        res.status(201).json({ message: "Admin registered successfully", user });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.registerAdmin = registerAdmin;
const registerCoordinator = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;
        const user = await (0, coordinator_service_1.registerCoordinatorService)(fullName, email, phone, password);
        res.status(201).json({ message: "Coordinator registered successfully", user });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.registerCoordinator = registerCoordinator;
const adminCreateUser = async (req, res) => {
    try {
        const { fullName, email, phone, password, role } = req.body;
        const user = await (0, admin_service_1.adminCreateUserService)(fullName, email, phone, password, role);
        res.status(201).json({ message: `${role} created successfully`, user });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.adminCreateUser = adminCreateUser;
const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const data = await (0, authservice_1.loginUserService)(identifier, password);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.loginUser = loginUser;
const socialLogin = async (req, res) => {
    try {
        const { provider, token, role } = req.body;
        const data = await (0, authservice_1.socialLoginService)(provider, token, role);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.socialLogin = socialLogin;
const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await (0, otp_service_1.generateOtp)(email);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.sendOtpController = sendOtpController;
const verifyOtpController = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const result = await (0, otp_service_1.verifyOtp)(userId, otp);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.verifyOtpController = verifyOtpController;
const forgotPassword = async (req, res) => {
    try {
        const result = await (0, email_service_1.forgotPasswordService)(req.body.email);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { password, token } = req.body;
        const result = await (0, email_service_1.resetPasswordService)(token, password);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.resetPassword = resetPassword;
const adminEditUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const result = await (0, admin_service_1.adminEditUserService)(userId, updates);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.adminEditUser = adminEditUser;
const adminDeleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await (0, admin_service_1.adminDeleteUserService)(userId);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.adminDeleteUser = adminDeleteUser;
const adminVerifyUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await (0, admin_service_1.adminVerifyUserService)(userId);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.adminVerifyUser = adminVerifyUser;
//# sourceMappingURL=auth.controller.js.map