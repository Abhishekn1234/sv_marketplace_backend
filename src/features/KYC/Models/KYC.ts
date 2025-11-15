import mongoose, { Document, Schema } from "mongoose";

/* ============================================================
   INDIVIDUAL DOCUMENT MODEL
   ============================================================ */

export interface IKYCDocument {
  _id?: string;
  category: "identity" | "address" | "income" | "other" | "business";
  documentType:
    | "saudi_id"
    | "iqama"
    | "national_address"
    | "cr"
    | "vat_certificate"
    | "bank_statement"
    | "salary_slip"
    | "other";
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt?: Date;
  status?: "pending" | "verified" | "rejected";
  remarks?: string;
}

const kycDocumentSchema = new Schema<IKYCDocument>(
  {
    category: {
      type: String,
      required: true,
      enum: ["identity", "address", "income", "other", "business"],
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
        "other",
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

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    remarks: { type: String },
  },
  { _id: false }
);

/* ============================================================
   MAIN KYC MODEL
   ============================================================ */

export interface IKYC extends Document {
  user: mongoose.Schema.Types.ObjectId;

  nationality: "Saudi" | "GCC" | "Other";

  address: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
  };

  userInfoSnapshot?: {
    fullName?: string;
    email?: string;
    phone?: string;
    bio?: string;
    address:string;
    profilePictureUrl:string;
  };

  documents: IKYCDocument[];

  overallStatus: "pending" | "verified" | "rejected" | "approved";

  remarks?: string;
  emailVerificationToken?: string;
}

const kycSchema = new Schema<IKYC>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

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
      address:{type:String},
      profilePictureUrl:{type:String}
    },
  },
  { timestamps: true }
);

export const KYC = mongoose.model<IKYC>("KYC", kycSchema);
