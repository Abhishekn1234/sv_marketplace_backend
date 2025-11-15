import { User } from "../../../../features/Auth/Models/User";
import { sendOtp } from "../../../../utils/Sendotp/sendOtp";

export const generateOtp = async (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error("Invalid email format");

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpire = otpExpire;
  await user.save();

  await sendOtp(email, otp);

  return { success: true, message: "OTP sent to email" };
};

export const verifyOtp = async (email: string, otp: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.otp || !user.otpExpire) throw new Error("OTP not generated");
  if (user.otp !== otp) throw new Error("Invalid OTP");
  if (user.otpExpire < new Date()) throw new Error("OTP expired");

  user.otp = "";
  user.otpExpire = new Date();
  user.isVerified = true;
  await user.save();

  return { success: true, message: "OTP verified successfully" };
};
