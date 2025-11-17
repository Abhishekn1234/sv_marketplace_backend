import axios from "axios";
import { User } from "../../Auth/Models/User";
import jwt from "jsonwebtoken";
import {
  emailRegex,
  phoneRegex,
  passwordRegex,
  strongPasswordRegex,
  validateRegistrationInputs,
} from "../../../utils/validations/User_Employee/validators";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/Auth_token/tokenUtils";
import { KYC } from "../../KYC/Models/KYC";

export const registerUserService = async (
  fullName: string,
  email: string,
  phone: string,
  password: string,
  role: string
) => {
  if (!["customer", "employee"].includes(role))
    throw new Error("Invalid role for self-registration");

  validateRegistrationInputs(email, phone, password);

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) throw new Error("User already exists");

  const user = await User.create({ fullName, email, phone, password, role });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  return {
    success: true,
    message: "User registered successfully",
    data: { user, accessToken, refreshToken },
  };
};

export const loginUserService = async (identifier: string, password: string) => {
  if (!emailRegex.test(identifier) && !phoneRegex.test(identifier))
    throw new Error("Invalid email or phone format");

 const user = await User.findOne({
  $or: [{ email: identifier }, { phone: identifier }],
}).select("-accessToken -refreshToken");


  if (!user) throw new Error("User not found");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error("Invalid credentials");

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  // Update last login
  user.LoginDate = new Date();
  user.LoginTime = new Date().toLocaleTimeString();
  await user.save();

  // Get user documents from KYC
  const kycDocuments = await KYC.find({ userId: user._id });

  // Remove unwanted fields from user object
  const {
    password: _,
    otp,
    otpExpire,
    __v,
    emailVerificationToken,
    resetPasswordToken,
    resetPasswordExpire,
    LoginDate,
    LoginTime,
    LogoutDate,
    LogoutTime,
    duration,
    createdAt,
    updatedAt,
    ...userData
  } = user.toObject();

  return {
    user: {
      ...userData,
      documents: kycDocuments,
    },
    accessToken,
    refreshToken,
  };
};
export const logOutService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const now = new Date();
  user.LogoutDate = now;
  user.LogoutTime = now.toLocaleTimeString();

  const loginTime = new Date(user.LoginDate).getTime();
  const logoutTime = now.getTime();
  const diffMs = Math.abs(logoutTime - loginTime);
  const diffMinutes = (diffMs / 60000).toFixed(2);
  const diffSeconds = Math.floor(diffMs / 1000);

  user.duration = `${diffMinutes} minutes (${diffSeconds} seconds)`;

  await user.save();
  return { message: "Logged out!" };
};

export const updateBio = async (userId: string, data: any) => {
  const allowedFields = [
    "fullName",
    "phone",
    "nationality",
    "dob",
    "address",
    "bio",
    "profilePictureUrl",
  ];

  const updates: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      updates[key] = key === "dob" ? new Date(data[key]) : data[key];
    }
  }

  return await User.findByIdAndUpdate(userId, { $set: updates }, { new: true })
    .select(
      "-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire -emailVerificationToken -__v -accessToken -refreshToken -LoginDate -LoginTime -LogoutDate -LogoutTime -duration"
    );
};

export const changePasswords = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) throw new Error("Current password is incorrect");

  if (!strongPasswordRegex.test(newPassword))
    throw new Error(
      "Password must be 8+ characters, include upper/lowercase, number & special character"
    );

  user.password = newPassword;
  await user.save();

  return { success: true, message: "Password updated successfully" };
};

export const getProfileService = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  // Get KYC documents for the user
  const kycDocuments = await KYC.find({ userId: user._id }).select(
    "-__v -createdAt -updatedAt"
  );

  // Remove unwanted fields from user object
  const {
    password,
    otp,
    otpExpire,
    resetPasswordToken,
    resetPasswordExpire,
    
    
    LoginDate,
    LoginTime,
    LogoutDate,
    LogoutTime,
    duration,
    __v,
    createdAt,
    updatedAt,
    ...userData
  } = user.toObject();

  return {
    ...userData,
    documents: kycDocuments,
  };
};

export const refreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) throw new Error("No refresh token provided");

  const payload: any = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET as string
  );

  const user = await User.findById(payload.id);
  if (!user) throw new Error("User not found");

  return {
    accessToken: generateAccessToken(user.id, user.role),
    refreshToken: generateRefreshToken(user.id, user.role),
  };
};

export const socialLoginService = async (
  provider: string,
  token: string,
  role: string
) => {
  let socialId = "";

  if (provider === "google") {
    const { data } = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    socialId = data.sub;
  }

  if (provider === "facebook") {
    const { data } = await axios.get(
      `https://graph.facebook.com/me?access_token=${token}`
    );
    socialId = data.id;
  }

  let user = await User.findOne({ "social.socialId": socialId });

  if (!user) {
    user = await User.create({
      role,
      social: { provider, socialId },
      fullName: "Social User",
      email: "",
      phone: "",
      password: "",
    });
  }

  const accessToken = generateAccessToken(user.id, user.role);

  return {
    success: true,
    message: "Social login successful",
    data: { user, accessToken },
  };
};
