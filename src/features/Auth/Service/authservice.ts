import { userRepo, validateIdentifier, validateRegistrationInputs, passwordRegex } from "shared-lib";
import { IUser, IKYCDocument } from "shared-lib";
import { LoginUserResponse, RegisterUserResponse, ChangePasswordResponse } from "shared-lib/dist/Types/User";
import jwt from "jsonwebtoken";
import { buildTokens, hashPassword, comparePassword } from "../Helpers/authhelpers";
import { buildUserData, getUserKyc, getUserRole } from "../Helpers/userHelpers";

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

  const user = await userRepo.createUser({
    fullName,
    email,
    phone,
    password,
    user_role: null,
  });

  const tokens = buildTokens(user._id.toString());
  const userResponse = await buildUserData(user);

  return { user: userResponse, ...tokens };
};

export const loginUserService = async (
  identifier: string,
  password: string
): Promise<LoginUserResponse> => {
  validateIdentifier(identifier);

  const user = await userRepo.findByIdentifier(identifier);
  if (!user) throw new Error("User not found");

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const kyc = await getUserKyc(user._id.toString());
  const tokens = buildTokens(user._id.toString());
  const userResponse = await buildUserData(user, kyc);

  return { user: userResponse, ...tokens };
};

export const changePasswords = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  if (!passwordRegex.test(newPassword)) throw new Error("Password does not meet criteria");

  const hashedPassword = await hashPassword(newPassword);
  await userRepo.updateUser(userId, { password: hashedPassword });

  return { success: true, message: "Password updated successfully" };
};

export const getProfileService = async (userId: string): Promise<IUser & { documents: IKYCDocument[] }> => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error("User not found");

  const kyc = await getUserKyc(userId);
  const userResponse = await buildUserData(user, kyc);

  return { ...userResponse, documents: userResponse.documents ?? [] };
};

export const refreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) throw new Error("No refresh token provided");

  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
  const user = await userRepo.findUserById(payload.id);
  if (!user) throw new Error("User not found");

  getUserRole(user);

  return buildTokens(user._id.toString());
};

export const logOutService = async (userId: string) => {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error("User not found");

  const now = new Date();
  const diff = now.getTime() - (user.LoginDate?.getTime() || now.getTime());

  const updatedData = {
    LogoutDate: now,
    LogoutTime: now.toLocaleTimeString(),
    duration: `${Math.floor(diff / 1000)} seconds`,
  };

  await userRepo.updateUser(userId, updatedData);

  return { message: "Logged out successfully" };
};
