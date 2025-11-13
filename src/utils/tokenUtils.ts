import jwt from "jsonwebtoken";

export const generateAccessToken = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET!, { expiresIn: "15m" });

export const generateRefreshToken = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

export const generateEmailVerificationToken = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET!, { expiresIn: "30d" });
