import { User } from "../Auth/User";
import { sendOtp } from "../utils/sendOtp";

// ---------------- GENERATE OTP ----------------
export const generateOtp = async (email: string) => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error("Invalid email format");

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 min

  // Save OTP to user
  user.otp = otp;
  user.otpExpire = otpExpire;
  await user.save();

  // Send OTP via email (can integrate with your free email service)
  await sendOtp(email, otp);

  return { success: true, message: "OTP sent to email" };
};

// ---------------- VERIFY OTP ----------------
export const verifyOtp = async (email: string, otp: string) => {
  
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  // Check OTP existence and validity
  if (!user.otp || !user.otpExpire) throw new Error("OTP not generated");
  if (user.otp !== otp) throw new Error("Invalid OTP");
  if (user.otpExpire < new Date()) throw new Error("OTP expired");

  // Mark as verified and clear OTP
  user.otp = "";
  user.otpExpire = new Date(Date.now());
  user.isVerified = true;
  await user.save();

  return { success: true, message: "OTP verified successfully" };
};
