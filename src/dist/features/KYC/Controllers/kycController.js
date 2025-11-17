"use strict";
// src/modules/KYC/controllers/kycController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKycById = exports.DeleteKYCDocument = exports.verifyKYC = exports.submitKYC = exports.getKYCByUser = void 0;
const kycService_1 = require("../Service/kycService");
const getKYCByUser = async (req, res) => {
    try {
        const userId = req.params.userId || req.user?._id;
        if (!userId)
            return res.status(400).json({ message: "User ID is required" });
        const kycs = await kycService_1.KYCService.getKYCByUser(userId.toString());
        if (!kycs.length)
            return res.status(404).json({ message: "No KYC documents found for this user" });
        res.json(kycs);
    }
    catch (err) {
        console.error("Error fetching KYC documents:", err);
        res.status(500).json({ message: err.message });
    }
};
exports.getKYCByUser = getKYCByUser;
const submitKYC = async (req, res) => {
    try {
        // Combine all uploaded files into a single array
        const filesArray = [];
        // console.log("req.files",req.files);
        // console.log(filesArray);
        const filesObj = req.files;
        if (filesObj) {
            Object.values(filesObj).forEach(fileArr => {
                filesArray.push(...fileArr);
            });
        }
        if (filesArray.length === 0)
            return res.status(400).json({ message: "No KYC files uploaded" });
        const { kyc, user } = await kycService_1.KYCService.submitKYC(req.user.id, req.body, filesArray);
        // console.log("KYC submitted successfully:", req.body);
        // console.log("Kyc files", filesArray);
        res.status(201).json(kyc);
    }
    catch (err) {
        console.error("KYC submission error:", err);
        res.status(500).json({ message: err.message });
    }
};
exports.submitKYC = submitKYC;
const verifyKYC = async (req, res) => {
    try {
        const { kycId, status, remarks } = req.body;
        const { kyc, user } = await kycService_1.KYCService.verifyKYC(kycId, status, remarks);
        res.json({ message: `KYC ${status}`, kyc, user });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.verifyKYC = verifyKYC;
const DeleteKYCDocument = async (req, res) => {
    try {
        const { kycId, documentId } = req.params;
        const result = await kycService_1.KYCService.deleteKYCDocument(kycId, documentId);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.DeleteKYCDocument = DeleteKYCDocument;
const getKycById = async (req, res) => {
    try {
        const KycId = req.params.kycId;
        const kyc = await kycService_1.KYCService.getKycById(KycId);
        res.json(kyc);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getKycById = getKycById;
//# sourceMappingURL=kycController.js.map