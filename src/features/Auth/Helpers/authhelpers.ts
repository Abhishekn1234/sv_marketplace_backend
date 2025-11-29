import bcrypt from "bcryptjs";
import { generateTokens } from "shared-lib";


export const buildTokens = (userId: string) => generateTokens(userId);


export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};


export const comparePassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash);
