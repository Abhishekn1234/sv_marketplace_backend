import { User } from "../../Auth/Models/User";
import bcrypt from "bcryptjs";
import { generateAccessToken,generateRefreshToken } from "../../../utils/tokenUtils";
export const registerAdminService = async (
  fullName: string,
  email: string,
  phone: string,
  password: string
) => {
  // ---------- VALIDATIONS ----------
  const nameRegex = /^[A-Za-z\s]{3,}$/; // At least 3 alphabetic characters
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+\d{1,3}\s?[1-9]\d{9}$/; // +country code + 10 digits (no leading zero)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,12}$/;

  if (!nameRegex.test(fullName))
    throw new Error("Full name must be at least 3 characters long and contain only letters");
  if (!emailRegex.test(email))
    throw new Error("Invalid email format");
  if (!phoneRegex.test(phone))
    throw new Error("Invalid phone number. Must include country code and 10 digits (e.g. +91 9876543210)");
  if (!passwordRegex.test(password))
    throw new Error("Password must be 8–12 characters long and contain letters and numbers");

  // ---------- CHECK FOR EXISTING ADMIN ----------
  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) throw new Error("Admin already exists");

  // ---------- CREATE ADMIN ----------
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: "admin",
  });

  // ---------- GENERATE TOKENS ----------
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  // ---------- RETURN CLEAN RESPONSE ----------
return { user, accessToken, refreshToken };

};




export const adminCreateUserService = async (fullName: string, email: string, phone: string, password: string, role: string) => {
  if (!["customer", "employee", "coordinator"].includes(role))
    throw new Error("Invalid role or cannot create admin");

  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, phone, password: hashedPassword, role });

  return { success: true, message: "User created by admin", data: user };
};

export const adminEditUserService = async (userId: string, updates: any) => {
  const allowedFields = ["fullName", "email", "phone", "role", "isVerified"];
  const filteredUpdates: any = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  const updatedUser = await User.findByIdAndUpdate(userId, filteredUpdates, { new: true });
  if (!updatedUser) throw new Error("User not found");

  return { message: "User updated successfully", user: updatedUser };
};

// ✅ Admin: Delete user
export const adminDeleteUserService = async (userId: string) => {
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) throw new Error("User not found");

  return { message: "User deleted successfully" };
};

// ✅ Admin: Verify user manually
export const adminVerifyUserService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.isVerified = true;
  await user.save();

  return { message: `${user.fullName || "User"} has been verified successfully`, user };
};
