import { IKYCDocument, KYC } from "../Models/KYC";
import { IUser, User } from "../../Auth/Models/User";
import cloudinary from "../../../config/cloudinary";

const mapFileToKYC = (fileName: string) => {
  const lower = fileName.toLowerCase();
  let category: "identity" | "address" | "income" | "other" = "other";

  if (["aadhaar","pan","passport","iqama"].some(k => lower.includes(k))) category = "identity";
  else if (["electricity","bill","rent"].some(k => lower.includes(k))) category = "address";
  else if (["salary","offer","income"].some(k => lower.includes(k))) category = "income";

  let documentType: string;
  if (lower.endsWith(".pdf")) documentType = "PDF Document";
  else if (lower.endsWith(".doc") || lower.endsWith(".docx")) documentType = "Word Document";
  else if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) documentType = "JPEG Image";
  else if (lower.endsWith(".png")) documentType = "PNG Image";
  else documentType = "Unknown";

  return { category, documentType };
};



export const KYCService = {


 async  getKYCByUser(userId: string) {
  // Fetch KYC records for the user, latest first
  const kycRecords = await KYC.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "userId",
      select:
        "fullName email phone profilePictureUrl address role nationality residencyStatus kycStatus",
    })
    .lean(); // converts to plain JS objects

  // Map KYC records for cleaner response
  return kycRecords.map((kyc) => {
    // Clean populated user object
    const { __v, createdAt, updatedAt, ...cleanUser } = kyc.userId as any;

    return {
      _id: kyc._id,
      nationality: kyc.nationality,
      address: kyc.address,
      overallStatus: kyc.overallStatus,
      remarks: kyc.remarks,
      user: cleanUser, // populated user info
      documents: (kyc.documents || []).map((doc) => ({
        category: doc.category,
        documentType: doc.documentType,
        fileName: doc.fileName,
        publicId: doc.publicId,
        filePath: doc.filePath,
        fileType: doc.fileType,
        uploadedAt: doc.uploadedAt,
        remarks: doc.remarks,
      })),
    };
  });
},


 async submitKYC(
  userId: string,
  body: any,
  files: Express.Multer.File[]
) {
  // Fetch user
  const user = await User.findById(userId).select(
    "fullName email phone bio address profilePictureUrl kycStatus"
  );
  if (!user) throw new Error("User not found");

  // Fetch existing KYC or create new
  let kyc = await KYC.findOne({ user: userId });
  if (!kyc) {
    kyc = new KYC({
      userId: userId,          // reference to user
      documents: [],
      overallStatus: "pending", // default
      // Removed userInfoSnapshot
    });
  } else {
    // Clear old documents
    kyc.documents = [];
  }

  // Map uploaded files
  files.forEach((f) => {
    let category: IKYCDocument["category"] = "document";
    let documentType: IKYCDocument["documentType"] = "uploaded_file";

    if (f.fieldname === "idProof") {
      category = "idProof";
      documentType = "idcard";
    } else if (f.fieldname === "addressProof") {
      category = "addressProof";
      documentType = "address";
    } else if (f.fieldname === "photo") {
      category = "photoProof";
      documentType = "photo";
    }

    const newDoc: IKYCDocument = {
      category,
      documentType,
      fileName: f.originalname,
      filePath: (f as any).path || (f as any).url || "",
      fileType: f.mimetype,
      publicId: (f as any).filename,
      uploadedAt: new Date(),
    };

    kyc.documents.push(newDoc);
  });

  // Save KYC
  await kyc.save();

  // Update user's kycStatus to match kyc.overallStatus
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { kycStatus: kyc.overallStatus },
    { new: true }
  ).select("fullName email phone kycStatus");

  return { kyc, user: updatedUser };
},


 async verifyKYC(
  kycId: string,
  status: "pending"  | "rejected" | "verified",
  remarks: string
) {
  const kyc = await KYC.findById(kycId);
  if (!kyc) throw new Error("KYC not found");

  // Update overallStatus (this is your main KYC status field)
  kyc.overallStatus = status;
  kyc.remarks = remarks;
  
  // If you want to update individual document statuses as well, you can do:
  

  await kyc.save();

  const userKYCStatusMap: Record<string, string> = {
    pending: "pending",
    approved: "verified", 
    verified: "verified",
    rejected: "rejected",
  };

  const mappedStatus = userKYCStatusMap[status];

  const user = await User.findByIdAndUpdate(
    kyc.userId,
    { kycStatus: mappedStatus },
    { new: true }
  ).select("fullName email phone kycStatus");

  return { kyc, user };
},

async deleteKYCDocument(userId: string, docId: string) {
  const kyc = await KYC.findOne({ user: userId });

  if (!kyc) throw new Error("KYC not found");

  const documentIndex = kyc.documents.findIndex(
    (doc) => doc._id?.toString() === docId
  );

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

async getKycById(kycId:string){
  const kyc=await KYC.findById(kycId).populate('user','fullName email phone kycStatus');
  if(!kyc){
    throw new Error("KYC not found");
  }
  return kyc;
}

};
