import { generateResetToken } from "./password";
import { User } from "shared-lib";
export const setResetTokenForUser = async (user: typeof User.prototype) => {
  const { token, hashed } = generateResetToken();
  user.resetPasswordToken = hashed;
  user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  return token;
};