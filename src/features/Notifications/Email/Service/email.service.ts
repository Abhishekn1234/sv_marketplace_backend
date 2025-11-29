import crypto from "crypto";
import { User } from "shared-lib/dist/Models/user.model";
import { sendEmail } from "../../Sendemail/sendEmail";
import {  validatePassword } from "../../utils/password";
import {
  resetPasswordEmail,
  passwordResetSuccessEmail,
} from "../../utils/emailTemplates";
import { setResetTokenForUser } from "../../utils/setresettokenforgotpassword";
import { findUserByResetToken } from "../../utils/findbyresettoken";

export const forgotPasswordService = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const token = await setResetTokenForUser(user);

  const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = resetPasswordEmail(user.fullName, url);
  await sendEmail(user.email, "Reset Your Password", html);

  return { success: true, message: "Password reset link sent to your email." };
};


export const resetPasswordService = async (token: string, password: string) => {
  if (!validatePassword(password))
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
    );

  const user = await findUserByResetToken(token);
  if (!user) throw new Error("Invalid or expired token");

  user.password = password;
  user.resetPasswordToken = "";
  user.resetPasswordExpire = undefined;
  await user.save();

  const html = passwordResetSuccessEmail(user.fullName);
  await sendEmail(user.email, "Your Password Has Been Reset", html);

  return { success: true, message: "Password reset successful and confirmation email sent." };
};
