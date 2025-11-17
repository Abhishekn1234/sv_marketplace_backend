"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYC = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const kycDocumentSchema = new mongoose_1.Schema({
    category: {
        type: String,
        required: true,
        enum: ["identity", "address", "income", "other", "business", "document", "idProof", "addressProof", "photoProof"],
    },
    documentType: {
        type: String,
        required: true,
        enum: [
            "saudi_id",
            "iqama",
            "national_address",
            "cr",
            "vat_certificate",
            "bank_statement",
            "salary_slip",
            "other", "uploaded_file", "idcard", "address", "photo"
        ],
    },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: {
        type: String,
        required: true,
        enum: [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
    },
    uploadedAt: { type: Date, default: Date.now },
    remarks: { type: String },
}, { _id: false });
const kycSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    nationality: {
        type: String,
        enum: ["Saudi", "GCC", "Other"],
    },
    address: {
        street: { type: String },
        city: { type: String },
        region: { type: String },
        postalCode: { type: String },
    },
    documents: [kycDocumentSchema],
    overallStatus: {
        type: String,
        enum: ["pending", "verified", "rejected", "approved"],
        default: "pending",
    },
    remarks: { type: String },
    emailVerificationToken: { type: String },
    userInfoSnapshot: {
        fullName: { type: String },
        email: { type: String },
        phone: { type: String },
        bio: { type: String },
        address: { type: String },
        profilePictureUrl: { type: String }
    },
}, { timestamps: true });
exports.KYC = mongoose_1.default.model("KYC", kycSchema);
//# sourceMappingURL=KYC.js.map