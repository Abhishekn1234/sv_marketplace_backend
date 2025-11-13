import { Request, Response } from "express";
import {
  registerUserService,loginUserService,
  socialLoginService,refreshTokenService} from "./authservice";
import { verifyOtp,generateOtp } from "../services/otp.service";
import { registerCoordinatorService } from "../services/coordinator.service";
import { forgotPasswordService,resetPasswordService, } from "../services/email.service";
import { registerAdminService,adminCreateUserService,adminDeleteUserService,adminEditUserService,adminVerifyUserService } from "../services/admin.service";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    const data = await registerUserService(fullName, email, phone, password, role);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Generate new Access Token from Refresh Token
export const Accesstoken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const data = await refreshTokenService(refreshToken);
    res.json(data); // returns: { accessToken, refreshToken, user }
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

// ✅ Admin Registration
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const user = await registerAdminService(fullName, email, phone, password);
    res.status(201).json({ message: "Admin registered successfully", user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Coordinator Registration
export const registerCoordinator = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const user = await registerCoordinatorService(fullName, email, phone, password);
    res.status(201).json({ message: "Coordinator registered successfully", user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Admin Creates User
export const adminCreateUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    const user = await adminCreateUserService(fullName, email, phone, password, role);
    res.status(201).json({ message: `${role} created successfully`, user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Login User
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    const data = await loginUserService(identifier, password);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Social Login (Google / Facebook)
export const socialLogin = async (req: Request, res: Response) => {
  try {
    const { provider, token, role } = req.body;
    const data = await socialLoginService(provider, token, role);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Send OTP
export const sendOtpController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await generateOtp(email);
    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Verify OTP
export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;
    const result = await verifyOtp(userId, otp);
    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Email Verification
// export const verifyEmail = async (req: Request, res: Response) => {
//   try {
//     const result = await verifyEmailService(req.params.token);
//     res.json(result);
//   } catch (err: any) {
//     res.status(400).json({ message: err.message });
//   }
// };

// ✅ Forgot Password (send reset email)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const result = await forgotPasswordService(req.body.email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    
    const { password,token } = req.body;
    const result = await resetPasswordService(token, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Admin: Edit User
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

// ✅ Admin: Delete User
export const adminDeleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await adminDeleteUserService(userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Admin: Verify User
export const adminVerifyUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await adminVerifyUserService(userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
