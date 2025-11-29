import { IUser, IKYCDocument, UserRole, IModule } from "shared-lib";
import { getLatestKyc, buildUserResponse, extractRoleName } from "shared-lib";


export const buildUserData = async (
  user: IUser,
  kycDocuments: IKYCDocument[] = [],
  role: UserRole | null = null,
  modules: IModule[] = []
) => buildUserResponse(user, kycDocuments, role, modules);


export const getUserKyc = async (userId: string): Promise<IKYCDocument[]> => {
  const kyc = await getLatestKyc(userId);
  return kyc ? [kyc] : [];
};

export const getUserRole = (user: IUser) => extractRoleName(user.user_role);
