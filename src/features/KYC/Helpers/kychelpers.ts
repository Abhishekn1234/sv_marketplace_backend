
import { KYC } from "../Models/KYC";
import { generateAccessToken, generateRefreshToken } from "../../Auth/Helpers/tokens";
import { emailRegex,phoneRegex,passwordRegex } from "../../Auth/Validators/validators";
// ------------------ COMMON HELPERS ------------------

// Validate identifier (email or phone)
export const validateIdentifier = (identifier: string) => {
  if (!emailRegex.test(identifier) && !phoneRegex.test(identifier))
    throw new Error("Invalid email or phone format");
};

// Generate both tokens for a user
export const generateTokens = (id: string, role: string) => {
  return {
    accessToken: generateAccessToken(id, role),
    refreshToken: generateRefreshToken(id, role),
  };
};

// Remove sensitive fields from user object
export const sanitizeUser = (userObj: any) => {
  const removeFields = [
    "password", "otp", "otpExpire", "resetPasswordToken", "resetPasswordExpire",
    "emailVerificationToken", "LoginDate", "LoginTime", "LogoutDate", "LogoutTime",
    "duration", "__v", "createdAt", "updatedAt", "accessToken", "refreshToken"
  ];

  removeFields.forEach(key => delete userObj[key]);
  return userObj;
};

// Get latest KYC document
export const getLatestKyc = async (userId: string) => {
  return await KYC.findOne({ userId })
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -overallStatus -userId")
    .lean();
};

// Allowed fields for profile update
export const filterAllowedUpdates = (data: any, allowed: string[]) => {
  const updates: any = {};
  allowed.forEach(key => {
    if (data[key] !== undefined) {
      updates[key] = key === "dob" ? new Date(data[key]) : data[key];
    }
  });
  return updates;
};
