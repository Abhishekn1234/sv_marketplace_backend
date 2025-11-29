import { User } from "shared-lib/dist/Models/user.model";
import { emailRegex, IUser, userRepo } from "shared-lib";
import { sendOtp } from "../../Sendotp/sendOtp";
import { createOtp, isOtpExpired } from "../../utils/otp";
import { otpEmailTemplate } from "../../utils/otpTemplates";

export const generateOtp = async (email: string) => {
  if (!emailRegex.test(email)) throw new Error("Invalid email format");

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const { otp, expire } = createOtp();

  user.otp = otp;
  user.otpExpire = expire;
  await user.save();

  const html = otpEmailTemplate(user.fullName, otp);
  await sendOtp(email, html);

  return { success: true, message: "OTP sent to email" };
};

export const verifyOtp= async (email: string, otp: string) => {
  const user = await userRepo.findUserByEmail(email);
  if (!user) throw new Error("User not found");

  if (!user.otp || !user.otpExpire) throw new Error("OTP not generated");
  if (user.otp !== otp) throw new Error("Invalid OTP");
  if (isOtpExpired(user.otpExpire)) throw new Error("OTP expired");

  user.otp = "";
  user.otpExpire = undefined;
  user.isVerified = true;
  //  await user.save();

  return { success: true, message: "OTP verified successfully" };
};
