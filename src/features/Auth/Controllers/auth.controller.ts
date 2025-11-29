import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  registerUserService,
  loginUserService,
  refreshTokenService,
  getProfileService,
  changePasswords,
  logOutService,
} from "../Service/authservice";
import { verifyOtp, generateOtp } from "../../Notifications/Otp/Service/otp.service";
import { forgotPasswordService, resetPasswordService } from "../../Notifications/Email/Service/email.service";
import { UserService } from "../Service/userService";
import { AuthRequest } from "../Middlewares/authMiddleware";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, phone, password, role } = req.body;
  const data = await registerUserService(fullName, email, phone, password, role);
  res.status(201).json(data);
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  const data = await loginUserService(identifier, password);
  res.json(data);
});

export const logoutUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await logOutService(req.user!._id.toString());
  res.json(result);
});

export const getProfileController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await getProfileService(req.user!._id.toString());
  res.json(profile);
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const result = await changePasswords(req.user!._id.toString(), currentPassword, newPassword);
  res.json(result);
});

export const submitBio = asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await UserService.updateBio(req.user!._id.toString(), req.body, req.file);
  res.json(updated);
});

export const accessToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await refreshTokenService(req.body.refreshToken);
  res.json(result);
});

export const sendOtpController = asyncHandler(async (req: Request, res: Response) => {
  const result = await generateOtp(req.body.email);
  res.json(result);
});

export const verifyOtpController = asyncHandler(async (req: Request, res: Response) => {
  const result = await verifyOtp(req.body.email, req.body.otp);
  res.json(result);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await forgotPasswordService(req.body.email);
  res.json(result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await resetPasswordService(req.body.token, req.body.password);
  res.json(result);
});
