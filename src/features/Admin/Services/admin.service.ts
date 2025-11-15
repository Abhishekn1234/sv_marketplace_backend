import { User } from "../../Auth/Models/User";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../../../utils/Auth_token/tokenUtils";
import { validateUserInput } from "../../../utils/validations/Admin/validator";

export const registerAdminService = async (
  fullName: string,
  email: string,
  phone: string,
  password: string
) => {
  validateUserInput(fullName, email, phone, password);

  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) throw new Error("Admin already exists");

  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: "admin",
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  await user.save();

  return { user, accessToken, refreshToken };
};

export const adminCreateUserService = async (
  fullName: string,
  email: string,
  phone: string,
  password: string,
  role: string
) => {
  if (!["customer", "employee", "coordinator"].includes(role))
    throw new Error("Invalid role or cannot create admin");

  validateUserInput(fullName, email, phone, password);

  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    phone,
    password: hashedPassword,
    role,
  });

  return { success: true, message: "User created successfully", data: user };
};

export const adminEditUserService = async (userId: string, updates: any) => {
  const allowedFields = ["fullName", "email", "phone", "role", "isVerified"];
  const filteredUpdates: Record<string, any> = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  const updatedUser = await User.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
  });

  if (!updatedUser) throw new Error("User not found");

  return { message: "User updated successfully", user: updatedUser };
};

export const adminDeleteUserService = async (userId: string) => {
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) throw new Error("User not found");

  return { message: "User deleted successfully" };
};

export const adminVerifyUserService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.isVerified = true;
  await user.save();

  return {
    message: `${user.fullName || "User"} has been verified successfully`,
    user,
  };
};
