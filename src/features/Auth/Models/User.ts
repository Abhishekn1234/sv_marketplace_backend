import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt:Date;
  updatedAt:Date;
  password: string;
  bio:string;
  role: "customer" | "employee" | "coordinator" | "admin";
  isVerified: boolean;
  kycStatus: "pending" | "verified" | "rejected" | "not_submitted" | "submitted";
  nationality: "Saudi" | "GCC" | "Other";
  dob: Date;
  profilePictureUrl:string;
profilePicturePublicId: string;
  address: string;
  social?: { provider?: string; socialId?: string };
  matchPassword(password: string): Promise<boolean>;
  otp?: string;
  otpExpire?: Date;
  emailVerificationToken?: string;
   __v?: number;
   



  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  LogoutTime:string;
  LogoutDate:Date;
  LoginTime:string;
  LoginDate:Date;
  duration:string;

}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
     LoginDate:{type:Date},
     LoginTime:{type:String},
     LogoutDate:{type:Date},
     LogoutTime:{type:String},
     duration:{type:String},
    // User general address (not KYC specific)
    address: { type: String },

    role: { type: String, enum: ["customer", "employee", "coordinator", "admin"], default: "customer" },
    isVerified: { type: Boolean, default: false },
    profilePictureUrl:{type:String},
    profilePicturePublicId:{type: String},
    nationality: { type: String, enum: ["Saudi", "GCC", "Other"] },
    dob: { type: Date },

    social: { provider: String, socialId: String },

    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "not_submitted", "submitted"],
      default: "not_submitted",
    },

    otp: String,
    otpExpire: Date,

    emailVerificationToken: String,
    

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
