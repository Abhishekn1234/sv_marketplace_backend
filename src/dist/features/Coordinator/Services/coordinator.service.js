"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCoordinatorService = void 0;
const User_1 = require("../../Auth/Models/User");
const tokenUtils_1 = require("../../../utils/Auth_token/tokenUtils");
const validators_1 = require("../../../utils/validations/Coordinator/validators");
const registerCoordinatorService = async (fullName, email, phone, password) => {
    (0, validators_1.validateCoordinatorInput)(fullName, email, phone, password);
    const exists = await User_1.User.findOne({ $or: [{ email }, { phone }] });
    if (exists)
        throw new Error("Coordinator already exists");
    const user = await User_1.User.create({
        fullName,
        email,
        phone,
        password,
        role: "coordinator",
    });
    const accessToken = (0, tokenUtils_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, tokenUtils_1.generateRefreshToken)(user.id, user.role);
    await user.save();
    return {
        user,
        accessToken,
        refreshToken,
    };
};
exports.registerCoordinatorService = registerCoordinatorService;
//# sourceMappingURL=coordinator.service.js.map