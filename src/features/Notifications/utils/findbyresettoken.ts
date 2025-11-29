import { User } from "shared-lib";
import crypto from "crypto"
export const findUserByResetToken = async (token: string) => {
  const hashedToken =crypto.createHash("sha256").update(token).digest("hex");
  return User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  });
};