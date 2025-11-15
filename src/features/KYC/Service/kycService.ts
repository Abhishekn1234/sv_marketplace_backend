import { KYC } from "../Models/KYC";
import { IUser, User } from "../../Auth/Models/User";

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
  async getKYCByUser(userId: string) {
  return KYC.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "fullName email phone profilePictureUrl address role nationality residencyStatus kycStatus",
    })
    .lean(); // Optional: converts to plain JS objects
},

 async submitKYC(userId: string, body: any, files: Express.Multer.File[]) {
  const { nationality, address } = body;
  const documentsMeta = body.documentsMeta ? JSON.parse(body.documentsMeta) : [];

  const user = await User.findById(userId).select("fullName email phone");
  if (!user) throw new Error("User not found");

  // Uploaded documents
  const uploadedFiles = files.map((f, i) => {
    const meta = documentsMeta[i] || {};
    const autoMeta = mapFileToKYC(f.originalname);

    return {
      category: meta.category || autoMeta.category,
      documentType: meta.documentType || autoMeta.documentType,
      fileName: f.originalname,
      filePath: f.path,
      fileType: f.mimetype,
      uploadedAt: new Date(),
     
    };
  });

  const kyc = await KYC.create({
    user: userId,
    nationality,
    documents: uploadedFiles,

    // ⬇ ADD ADDRESS TO KYC
    address: {
      street: address?.street,
      city: address?.city,
      region: address?.region,
      postalCode: address?.postalCode
    },

    // ⬇ SAVE USER SNAPSHOT
    userInfoSnapshot: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      bio:user.bio,
      address:user.address,
      profilePictureUrl:user.profilePictureUrl
    },

    overallStatus: "pending",
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { kycStatus: "submitted" },
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
  kyc.documents.forEach(doc => {
    doc.status = status; // This updates each document's status
  });

  await kyc.save();

  const userKYCStatusMap: Record<string, string> = {
    pending: "pending",
    approved: "verified", 
    verified: "verified",
    rejected: "rejected",
  };

  const mappedStatus = userKYCStatusMap[status];

  const user = await User.findByIdAndUpdate(
    kyc.user,
    { kycStatus: mappedStatus },
    { new: true }
  ).select("fullName email phone kycStatus");

  return { kyc, user };
},

async deletKYC(kycId:string){
  const kyc =await KYC.findByIdAndDelete(kycId);
  if(!kyc){
   throw new Error("KYC not found");

  }
  return{message:"KYC deleted successfully"}
},

async getKycById(kycId:string){
  const kyc=await KYC.findById(kycId).populate('user','fullName email phone kycStatus');
  if(!kyc){
    throw new Error("KYC not found");
  }
  return kyc;
}

};
