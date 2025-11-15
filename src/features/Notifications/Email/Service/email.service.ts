import crypto from "crypto";
import { User } from "../../../Auth/Models/User";
import { sendEmail } from "../../../../utils/Sendemail/sendEmail";

/**
 * STEP 1: Send password reset email
 */
export const forgotPasswordService = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  // Create reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
  await user.save();

  // Send reset password email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const html = `
    <h2>Password Reset Request</h2>
    <p>Hello ${user.fullName}, click the button below to reset your password:</p>
    <a href="${resetUrl}" style="background:#007bff;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Reset Password</a>
    <p>This link expires in 1 hour.</p>
  `;

  await sendEmail(user.email, "Reset Your Password", html);

  return { success: true, message: "Password reset link sent to your email." };
};

/**
 * STEP 2: Reset password using the token
 */
export const resetPasswordService = async (token: string, password: string) => {

 const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
    );
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  });

  if (!user) throw new Error("Invalid or expired token");
   
  // Update password
  user.password = password;
  user.resetPasswordToken = "";
  user.resetPasswordExpire = undefined;
  await user.save();

  // Send confirmation email
  const html = `
    <h2>Password Reset Successful</h2>
    <p>Hello ${user.fullName}, your password has been reset successfully.</p>
    <p>If you did not request this change, please contact support immediately.</p>
  `;
  await sendEmail(user.email, "Your Password Has Been Reset", html);

  return { success: true, message: "Password reset successful and confirmation email sent." };
};
