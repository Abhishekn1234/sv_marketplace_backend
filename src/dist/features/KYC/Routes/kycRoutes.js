"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const kycController_1 = require("../Controllers/kycController");
const authMiddleware_1 = require("../../Middlewares/Auth/authMiddleware");
const uploadMiddleware_1 = require("../../Middlewares/UploadImage/uploadMiddleware");
const router = express_1.default.Router();
router.post("/submit", authMiddleware_1.protect, authMiddleware_1.isCustomer, uploadMiddleware_1.uploadKYC, kycController_1.submitKYC);
router.get("/me", authMiddleware_1.protect, (req, res) => {
    return (0, kycController_1.getKYCByUser)(req.user?.id.toString(), res);
});
router.get("/user/kyc/:userId", authMiddleware_1.protect, (req, res, next) => {
    if (req.user?.role === "admin" ||
        req.user?._id.toString() === req.params.userId) {
        return next();
    }
    return res.status(403).json({ message: "Forbidden" });
}, kycController_1.getKYCByUser);
router.get("/kyc/:kycId", authMiddleware_1.protect, kycController_1.getKycById);
router.delete("/:kycId/document/:documentId", authMiddleware_1.protect, authMiddleware_1.isAdmin, kycController_1.DeleteKYCDocument);
router.post("/verify", authMiddleware_1.protect, authMiddleware_1.isAdmin, kycController_1.verifyKYC);
exports.default = router;
//# sourceMappingURL=kycRoutes.js.map