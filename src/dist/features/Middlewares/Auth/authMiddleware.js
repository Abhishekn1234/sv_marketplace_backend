"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCustomer = exports.isCoordinator = exports.isEmployee = exports.isAdmin = exports.authorizeRoles = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../../Auth/Models/User");
// 🛡️ Protect Middleware — verifies JWT and attaches user
const protect = async (req, res, next) => {
    try {
        let token;
        // console.log(req.headers.authorization);
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        //   console.log("token",token);
        //  console.log("process.env.JWT_ACCESS_SECRET",process.env.JWT_ACCESS_SECRET);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        // console.log("decoded",decoded);
        const user = await User_1.User.findById(decoded.id).select("-password");
        //  console.log(user);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        // console.log(req.user);
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.protect = protect;
// 🔒 Role-based Access Middleware Generator
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access denied for role: ${req.user.role}` });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// 🧩 Specific Role Shortcuts (optional convenience middlewares)
exports.isAdmin = (0, exports.authorizeRoles)("admin");
exports.isEmployee = (0, exports.authorizeRoles)("employee", "admin"); // admins can access employee routes too
exports.isCoordinator = (0, exports.authorizeRoles)("coordinator", "admin");
exports.isCustomer = (0, exports.authorizeRoles)("customer", "admin", "employee");
//# sourceMappingURL=authMiddleware.js.map