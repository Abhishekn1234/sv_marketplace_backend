
import { KYCFileType,KYCFileCategory } from "../Types/Kyc";
export const mapFileToKYC = (
  file: Express.Multer.File
): { category: KYCFileCategory; documentType: KYCFileType } => {

  let category: KYCFileCategory = "photoProof";
  let documentType: KYCFileType = "other";

  if (file.fieldname.includes("id")) {
    category = "idProof";
    documentType = "identity";
  } else if (file.fieldname.includes("address")) {
    category = "addressProof";
    documentType = "address";
  }

  return { category, documentType };
};
