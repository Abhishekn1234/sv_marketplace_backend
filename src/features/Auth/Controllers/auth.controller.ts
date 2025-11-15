import { Request, Response } from "express";
import {
  registerUserService,
  loginUserService,
  socialLoginService,
  refreshTokenService,
  getProfileService,
  changePasswords,
  logOutService,
  updateBio
} from "../Service/authservice";

import { verifyOtp, generateOtp } from "../../Notifications/Otp/Service/otp.service";
import { registerCoordinatorService } from "../../Coordinator/Services/coordinator.service";
import {
  forgotPasswordService,
  resetPasswordService
} from "../../Notifications/Email/Service/email.service";

import {
  registerAdminService,
  adminCreateUserService,
  adminDeleteUserService,
  adminEditUserService,
  adminVerifyUserService
} from "../../Admin/Services/admin.service";

import { AuthRequest } from "../../Middlewares/Auth/authMiddleware";

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
    const { fullName, phone, nationality, dob, address, bio } = req.body;

    const profilePicture = req.file ? req.file.path : undefined;

    const updatedUser = await updateBio(userId, {
      fullName,
      phone,
      nationality,
      dob,
      address,
      bio,
      profilePictureUrl: profilePicture
    });

    res.status(200).json(updatedUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
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

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const user = await registerAdminService(fullName, email, phone, password);
    res.status(201).json({ message: "Admin registered successfully", user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const registerCoordinator = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const user = await registerCoordinatorService(fullName, email, phone, password);
    res.status(201).json({ message: "Coordinator registered successfully", user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const adminCreateUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    const user = await adminCreateUserService(fullName, email, phone, password, role);
    res.status(201).json({ message: `${role} created successfully`, user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
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

export const socialLogin = async (req: Request, res: Response) => {
  try {
    const { provider, token, role } = req.body;
    const data = await socialLoginService(provider, token, role);
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

export const adminEditUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const result = await adminEditUserService(userId, updates);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const adminDeleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await adminDeleteUserService(userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const adminVerifyUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await adminVerifyUserService(userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
