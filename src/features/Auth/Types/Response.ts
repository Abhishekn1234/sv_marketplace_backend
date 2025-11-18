import { IUser, User } from "../Models/User";
import { IKYCDocument, IKYC } from "../../KYC/Models/KYC";
 export interface RegisterUserResponse {
  user: IUser & { documents: IKYCDocument[]; kycStatus: string };
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

 export  interface LoginUserResponse {
  user: IUser & { documents: IKYCDocument[]; kycStatus: string };
  accessToken: string;
  refreshToken: string;
}

export interface UpdateBioData {
  fullName?: string;
  phone?: string;
  dob?: Date | string;
  bio?: string;
  address?: string;
  profilePictureUrl?: string;
  nationality?: string;
}