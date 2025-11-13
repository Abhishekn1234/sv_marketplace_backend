
import axios from "axios";
import { User } from "./User";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils";
import jwt from "jsonwebtoken";

// ---------------- REGISTER ----------------
export const registerUserService = async (
  fullName: string,
  email: string,
  phone: string,
  password: string,
  role: string
) => {
  console.log(phone);
  if (!["customer", "employee"].includes(role))
    throw new Error("Invalid role for self-registration");

  // -------- VALIDATIONS --------
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+\d{1,3}\s?[1-9]\d{9}$/;

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,12}$/;

  if (!emailRegex.test(email)) throw new Error("Invalid email format");
   if (!phoneRegex.test(phone))
     throw new Error("Invalid phone number. Must include country code and 10 digits");
  if (!passwordRegex.test(password))
    throw new Error(
      "Password must be 8–12 characters long and contain letters and numbers"
    );

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) throw new Error("User already exists");

  const user = await User.create({ fullName, email, phone, password, role });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  return {
    success: true,
    message: "User registered successfully",
    data: { user, accessToken, refreshToken },
  };
};

// ---------------- LOGIN ----------------
export const loginUserService = async (identifier: string, password: string) => {
  // -------- VALIDATIONS --------
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+\d{1,3}\s?[1-9]\d{9}$/;

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,12}$/;

  if (!passwordRegex.test(password))
    throw new Error(
      "Password must be 8–12 characters long and contain letters and numbers"
    );

  if (!emailRegex.test(identifier) && !phoneRegex.test(identifier))
    throw new Error("Invalid email or phone format");

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });
  if (!user) throw new Error("User not found");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  const {
    password: _,
    otp,
    otpExpire,
    resetPasswordToken,
    resetPasswordExpire,
    ...userData
  } = user.toObject();

  return userData;
};

// ---------------- REFRESH TOKEN ----------------
export const refreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) throw new Error("No refresh token provided");

  let payload: any;
  try {
    payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    );
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await User.findById(payload.id);
  if (!user) throw new Error("User not found");

  if (user.refreshToken !== refreshToken)
    throw new Error("Refresh token does not match");

  const newAccessToken = generateAccessToken(user.id, user.role);
  const newRefreshToken = generateRefreshToken(user.id, user.role);

  user.refreshToken = newRefreshToken;
  user.accessToken = newAccessToken;
  await user.save();

  const { password, refreshToken: _, ...userData } = user.toObject();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: userData,
  };
};

// ---------------- SOCIAL LOGIN ----------------
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
  } else if (provider === "facebook") {
    const { data } = await axios.get(
      `https://graph.facebook.com/me?access_token=${token}`
    );
    socialId = data.id;
  } else {
    throw new Error("Unsupported provider");
  }

  let user = await User.findOne({ "social.socialId": socialId });
  if (!user) {
    user = await User.create({
      role,
      social: { provider, socialId },
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
