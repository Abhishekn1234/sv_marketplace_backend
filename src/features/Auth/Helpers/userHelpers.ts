import { IUser, IKYCDocument, UserRole, IModule } from "shared-lib";
import { getLatestKyc, buildUserResponse, extractRoleName } from "shared-lib";


export const buildUserData = async (
  user: any,
  kycDocuments: any[] = [],
  role: UserRole | null = null,
  modules: IModule[] = []
) => {
  const userResp = await buildUserResponse(user, kycDocuments, role, modules);

  
  const flattenedDocs = userResp.documents?.flatMap((docWrapper: any) => docWrapper.documents || []) || [];

  return {
    ...userResp,
    documents: flattenedDocs,
  };
};


export const getUserKyc = async (userId: string): Promise<IKYCDocument[]> => {
  const kyc = await getLatestKyc(userId);
  return kyc ? [kyc] : [];
};

export const getUserRole = (user: IUser) => extractRoleName(user.user_role);
