import { userRepo } from "../Repositories/user";
import { getLatestKyc } from "../../KYC/Helpers/kychelpers";
import { validateIdentifier,validateRegistrationInputs } from "../Validators/validators";
import { generateTokens } from "../Helpers/tokens";
import { sanitizeUser } from "../utils/sanitizer";
import { filterAllowedUpdates } from "../../KYC/Helpers/kychelpers";
import jwt from "jsonwebtoken";
import { passwordRegex } from "../Validators/validators";
import { IUser, User } from "../Models/User";
import { IKYCDocument, IKYC } from "../../KYC/Models/KYC";
import { UpdateBioData,ChangePasswordResponse,LoginUserResponse,RegisterUserResponse } from "../Types/Response";
export const registerUserService = async (
  fullName: string,
  email: string,
  phone: string,
  password: string,
  role: "customer" | "employee"
): Promise<RegisterUserResponse> => {
  validateRegistrationInputs(email, phone, password);

  const exists = await userRepo.findUserByEmailOrPhone(email, phone);
  if (exists) throw new Error("User already exists");

  const user = await userRepo.createUser({ fullName, email, phone, password, role });

  const userWithDocuments: RegisterUserResponse["user"] = {
    ...sanitizeUser(user.toObject()),
    documents: [],
    kycStatus: "not_submitted",
  };

  const { accessToken, refreshToken } = generateTokens(user._id.toString(), role);

  return { user: userWithDocuments, accessToken, refreshToken };
};

export const changePasswords = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error("User not found");
  //  console.log(user);
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) throw new Error("Current password is incorrect");

  if (!passwordRegex.test(newPassword)) {
    throw new Error(
      "Password must be 8+ characters, include upper/lowercase, number & special character"
    );
  }

  user.password = newPassword;
  await user.save();

  return { success: true, message: "Password updated successfully" };
};

export const loginUserService = async (
  identifier: string,
  password: string
): Promise<LoginUserResponse> => {
  validateIdentifier(identifier);

  const user = await userRepo.findByIdentifier(identifier);
  if (!user) throw new Error("User not found");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error("Invalid credentials");

  const kyc = await getLatestKyc(user._id.toString());

  const userWithDocuments: LoginUserResponse["user"] = {
    ...sanitizeUser(user.toObject()),
    documents: kyc?.documents || [],
   
  };

  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

  return { user: userWithDocuments, accessToken, refreshToken };
};

export const logOutService = async (userId: string): Promise<{ message: string }> => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error("User not found");

  const now = new Date();
  const diff = now.getTime() - (user.LoginDate?.getTime() || now.getTime());

  user.LogoutDate = now;
  user.LogoutTime = now.toLocaleTimeString();
  user.duration = `${Math.floor(diff / 1000)} seconds`;
  await user.save();

  return { message: "Logged out!" };
};

export const updateBio = async (userId: string, data: UpdateBioData): Promise<IUser> => {
  const filtered = filterAllowedUpdates(data, [
    "fullName",
    "phone",
    "dob",
    "bio",
    "address",
    "profilePictureUrl",
  ]);

  const updatedUser = await userRepo.updateUserById(userId, filtered);
  return updatedUser!;
};

export const getProfileService = async (
  userId: string
): Promise<IUser & { documents: IKYCDocument[]; kycStatus: string }> => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error("User not found");

  const latestKyc = await getLatestKyc(userId);

  return {
    ...sanitizeUser(user.toObject()),
    documents: latestKyc?.documents || [],
    
  };
};

export const refreshTokenService = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  if (!refreshToken) throw new Error("No refresh token");

  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };

  const user = await userRepo.findUserById(payload.id);
  if (!user) throw new Error("User not found");

  return generateTokens(user._id.toString(), user.role);
};
