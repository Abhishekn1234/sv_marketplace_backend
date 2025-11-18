import { Request, Response } from "express";
import {
  registerUserService,
  loginUserService,
 
  refreshTokenService,
  getProfileService,
  changePasswords,
  logOutService,
  updateBio
} from "../Service/authservice";

import { verifyOtp, generateOtp } from "../../Notifications/Otp/Service/otp.service";

import {
  forgotPasswordService,
  resetPasswordService
} from "../../Notifications/Email/Service/email.service";
import { AuthRequest } from "../Middlewares/authMiddleware";
import { UserService } from "../Service/userService";
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    const data = await registerUserService(fullName, email, phone, password, role);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
export const logoutUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const result = await logOutService(userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const submitBio = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const updatedUser = await UserService.updateBio(userId, req.body, req.file);

    return res.status(200).json(updatedUser);

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { currentPassword, newPassword } = req.body;

    const result = await changePasswords(userId, currentPassword, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getProfileController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const result = await getProfileService(userId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const Accesstoken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const data = await refreshTokenService(refreshToken);
    res.json(data);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    const data = await loginUserService(identifier, password);
     res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
export const sendOtpController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await generateOtp(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;
    const result = await verifyOtp(userId, otp);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const result = await forgotPasswordService(req.body.email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password, token } = req.body;
    const result = await resetPasswordService(token, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
