import mongoose, { Document, Schema } from "mongoose";

export interface IKYCDocument {
  category: string; // e.g. "identity", "address", "income" — can be anything
  documentType: string; // e.g. "Aadhaar Card", "PAN Card", "Passport"
  fileName: string;
  filePath: string;
  fileType: string; // e.g. "image/jpeg", "application/pdf"
  uploadedAt?: Date;
}

export interface IKYC extends Document {
  user: mongoose.Schema.Types.ObjectId;
  aadhaarNumber?: string;
  panNumber?: string;
  documents: IKYCDocument[];
  status: "pending" | "verified" | "rejected";
  remarks?: string;
  emailVerificationToken?: string;
}

const kycDocumentSchema = new Schema<IKYCDocument>(
  {
    category: { type: String, required: true },
    documentType: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const kycSchema = new Schema<IKYC>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    aadhaarNumber: String,
    panNumber: String,
    emailVerificationToken: String,
    documents: [kycDocumentSchema],
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    remarks: String,
  },
  { timestamps: true }
);

export const KYC = mongoose.model<IKYC>("KYC", kycSchema);
