"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCService = void 0;
const KYC_1 = require("../Models/KYC");
const User_1 = require("../../Auth/Models/User");
const mapFileToKYC = (fileName) => {
    const lower = fileName.toLowerCase();
    let category = "other";
    if (["aadhaar", "pan", "passport", "iqama"].some(k => lower.includes(k)))
        category = "identity";
    else if (["electricity", "bill", "rent"].some(k => lower.includes(k)))
        category = "address";
    else if (["salary", "offer", "income"].some(k => lower.includes(k)))
        category = "income";
    let documentType;
    if (lower.endsWith(".pdf"))
        documentType = "PDF Document";
    else if (lower.endsWith(".doc") || lower.endsWith(".docx"))
        documentType = "Word Document";
    else if (lower.endsWith(".jpeg") || lower.endsWith(".jpg"))
        documentType = "JPEG Image";
    else if (lower.endsWith(".png"))
        documentType = "PNG Image";
    else
        documentType = "Unknown";
    return { category, documentType };
};
exports.KYCService = {
    async getKYCByUser(userId) {
        return KYC_1.KYC.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate({
            path: "user",
            select: "fullName email phone profilePictureUrl address role nationality residencyStatus kycStatus",
        })
            .lean(); // Optional: converts to plain JS objects
    },
    async submitKYC(userId, body, files) {
        const user = await User_1.User.findById(userId).select("fullName email phone bio address profilePictureUrl kycStatus");
        if (!user)
            throw new Error("User not found");
        let kyc = await KYC_1.KYC.findOne({ user: userId });
        if (!kyc) {
            kyc = new KYC_1.KYC({
                user: userId,
                documents: [],
                overallStatus: "pending",
                userInfoSnapshot: {
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    bio: user.bio,
                    address: typeof user.address === "string" ? user.address : JSON.stringify(user.address),
                    profilePictureUrl: user.profilePictureUrl,
                },
            });
        }
        else {
            // Clear old documents completely
            kyc.documents = [];
        }
        // Map uploaded files based on field name
        files.forEach((f) => {
            let category = "document";
            let documentType = "uploaded_file";
            if (f.fieldname === "idProof") {
                category = "idProof";
                documentType = "idcard";
            }
            else if (f.fieldname === "addressProof") {
                category = "addressProof";
                documentType = "address";
            }
            else if (f.fieldname === "photo") {
                category = "photoProof";
                documentType = "photo";
            }
            const newDoc = {
                category,
                documentType,
                fileName: f.originalname,
                filePath: f.path || f.url || "",
                fileType: f.mimetype,
                publicId: f.filename,
                uploadedAt: new Date(),
            };
            kyc.documents.push(newDoc);
        });
        await kyc.save();
        const updatedUser = await User_1.User.findByIdAndUpdate(userId, { kycStatus: "submitted" }, { new: true }).select("fullName email phone kycStatus");
        return { kyc, user: updatedUser };
    },
    async verifyKYC(kycId, status, remarks) {
        const kyc = await KYC_1.KYC.findById(kycId);
        if (!kyc)
            throw new Error("KYC not found");
        // Update overallStatus (this is your main KYC status field)
        kyc.overallStatus = status;
        kyc.remarks = remarks;
        // If you want to update individual document statuses as well, you can do:
        await kyc.save();
        const userKYCStatusMap = {
            pending: "pending",
            approved: "verified",
            verified: "verified",
            rejected: "rejected",
        };
        const mappedStatus = userKYCStatusMap[status];
        const user = await User_1.User.findByIdAndUpdate(kyc.user, { kycStatus: mappedStatus }, { new: true }).select("fullName email phone kycStatus");
        return { kyc, user };
    },
    async deleteKYCDocument(userId, docId) {
        const kyc = await KYC_1.KYC.findOne({ user: userId });
        if (!kyc)
            throw new Error("KYC not found");
        const documentIndex = kyc.documents.findIndex((doc) => doc._id?.toString() === docId);
        if (documentIndex === -1)
            throw new Error("Document not found");
        // Remove the document
        kyc.documents.splice(documentIndex, 1);
        // If no documents left → mark KYC as rejected
        if (kyc.documents.length === 0) {
            kyc.overallStatus = "rejected";
        }
        await kyc.save();
        return { message: "Document deleted successfully" };
    },
    async getKycById(kycId) {
        const kyc = await KYC_1.KYC.findById(kycId).populate('user', 'fullName email phone kycStatus');
        if (!kyc) {
            throw new Error("KYC not found");
        }
        return kyc;
    }
};
//# sourceMappingURL=kycService.js.map