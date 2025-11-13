import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: "customer" | "employee" | "coordinator" | "admin";
  isVerified: boolean;
  social: { provider?: string; socialId?: string };
  kycStatus: "pending" | "verified" | "rejected" | "not_submitted" |"submitted";
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  matchPassword(password: string): Promise<boolean>;
   emailVerificationToken:string;
   refreshToken:string;
   accessToken:string;
   otp:string;
   otpExpire:Date;
}

const userSchema = new Schema<IUser>(
  {
    emailVerificationToken:{type:String},
    refreshToken:{type:String},
    accessToken:{type:String},
    otp:{type:String},
    otpExpire:{type:Date},
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    social: {
      provider: { type: String },
      socialId: { type: String },
    },
    role: {
      type: String,
      enum: ["customer", "employee", "coordinator", "admin"],
      default: "customer",
    },
    isVerified: { type: Boolean, default: false },
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "not_submitted","submitted"],
      default: "not_submitted",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method
userSchema.methods.matchPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
