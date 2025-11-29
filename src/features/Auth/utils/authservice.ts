// import {
//   userRepo,
//   validateIdentifier,
//   validateRegistrationInputs,
//   generateTokens,
//   sanitizeUser,
//   filterAllowedUpdates,
//   getLatestKyc,
//   passwordRegex,
//   extractRoleName,
//   KycLeanWithDocuments
// } from "shared-lib";
// import bcrypt from "bcryptjs";
// import { IUser } from "shared-lib";
// import { IKYCDocument } from "shared-lib";
// import {
//   UpdateBioData,
//   ChangePasswordResponse,
//   LoginUserResponse,
//   RegisterUserResponse
// } from "shared-lib/dist/Types/User";
// import jwt from "jsonwebtoken";

// // 🔹 Helper functions
// const hashPassword = async (password: string) => {
//   const salt = await bcrypt.genSalt(10);
//   return bcrypt.hash(password, salt);
// };

// const verifyPassword = async (plain: string, hashed: string) => {
//   const isMatch = await bcrypt.compare(plain, hashed);
//   if (!isMatch) throw new Error("Invalid password");
// };

// const getUserOrFail = async (userId: string) => {
//   const user = await userRepo.findUserById(userId);
//   if (!user) throw new Error("User not found");
//   return user;
// };

// const buildUserResponse = async (user: IUser, includeKyc = false) => {
//   const documents = includeKyc ? await getLatestKyc(user._id.toString()) : [];
//   return { ...sanitizeUser(user), documents };
// };
