"use strict";
// utils/validators.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoordinatorInput = exports.passwordRegex = exports.phoneRegex = exports.emailRegex = exports.nameRegex = void 0;
exports.nameRegex = /^[A-Za-z\s]{3,}$/;
exports.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
exports.phoneRegex = /^\+\d{1,3}\s?[1-9]\d{9}$/;
exports.passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,12}$/;
const validateCoordinatorInput = (fullName, email, phone, password) => {
    if (!exports.nameRegex.test(fullName))
        throw new Error("Full name must be at least 3 characters long and contain only letters");
    if (!exports.emailRegex.test(email))
        throw new Error("Invalid email format");
    if (!exports.phoneRegex.test(phone))
        throw new Error("Invalid phone number. Must include country code and 10 digits");
    if (!exports.passwordRegex.test(password))
        throw new Error("Password must be 8–12 characters long and contain letters and numbers");
};
exports.validateCoordinatorInput = validateCoordinatorInput;
//# sourceMappingURL=validators.js.map