import { User } from "../Auth/User";
import { generateAccessToken,generateRefreshToken } from "../utils/tokenUtils";
export const registerCoordinatorService = async (
  fullName: string,
  email: string,
  phone: string,
  password: string
) => {
  // ---------- VALIDATIONS ----------
  const nameRegex = /^[A-Za-z\s]{3,}$/; // At least 3 letters, only alphabets & spaces
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email format
  const phoneRegex = /^\+\d{1,3}\s?[1-9]\d{9}$/; // +country code + 10 digits (no leading zero)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,12}$/; // 8–12 chars, letters + numbers

  if (!nameRegex.test(fullName))
    throw new Error(
      "Full name must be at least 3 characters long and contain only letters"
    );
  if (!emailRegex.test(email))
    throw new Error("Invalid email format");
  if (!phoneRegex.test(phone))
    throw new Error(
      "Invalid phone number. Must include country code and 10 digits (e.g. +91 9876543210)"
    );
  if (!passwordRegex.test(password))
    throw new Error(
      "Password must be 8–12 characters long and contain letters and numbers"
    );

  // ---------- CHECK EXISTING COORDINATOR ----------
  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) throw new Error("Coordinator already exists");

  // ---------- CREATE COORDINATOR ----------
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: "coordinator",
  });

  // ---------- GENERATE TOKENS ----------
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  // ---------- RETURN CLEAN RESPONSE ----------
  return {
   
    
      user,
      accessToken,
      refreshToken,
   
  };
};
