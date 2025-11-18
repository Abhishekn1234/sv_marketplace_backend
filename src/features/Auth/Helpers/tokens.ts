import jwt from "jsonwebtoken";

export const generateTokens = (id: string, role: string) => {
  const accessToken = jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};




export const generateAccessToken = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET!, { expiresIn: "4h" });

export const generateRefreshToken = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

export const generateEmailVerificationToken = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET!, { expiresIn: "30d" });
