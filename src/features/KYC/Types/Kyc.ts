import { IUser } from "../../Auth/Models/User";
export interface SubmitKYCBody {
  nationality?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
  };
  userInfoSnapshot?: Partial<Pick<IUser, "fullName" | "email" | "phone" | "bio" | "address" | "profilePictureUrl">>;
}

export type KYCStatus = "pending" | "verified" | "rejected" | "approved" | "not_submitted" | "submitted";

export type KYCFileCategory =
  | "idProof"
  | "addressProof"
  | "photoProof";

export type KYCFileType =
  | "identity"
  | "address"
  | "business"
  | "income"
  | "document"
  | "other";