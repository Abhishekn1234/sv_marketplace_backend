import { Response } from "express";
import { AuthRequest } from "../../Auth/Middlewares/authMiddleware";
import { KYCService } from "../Services/kycService";
import { mergeMulterFiles, formatKycResponse } from "shared-lib";
import { controllerWrapper } from "../helpers/controllerWrapper";
import { ok, badRequest, unauthorized, notFound } from "../helpers/response";

export const getKYCByUser = controllerWrapper(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId || req.user?._id;
  if (!userId) return badRequest(res, "User ID is required");

  const documents = await KYCService.getKYCByUser(userId.toString());
  if (!documents?.length) return notFound(res, "No KYC documents found");

  return ok(res, { documents });
});

export const submitKYC = controllerWrapper(async (req: AuthRequest, res: Response) => {
  if (!req.user) return unauthorized(res);

  const files = mergeMulterFiles(req.files as Record<string, Express.Multer.File[]>);
  if (!files.length) return badRequest(res, "No KYC files uploaded");

  const kyc = await KYCService.submitKYC(req.user._id.toString(), req.body, files);
  return ok(res, formatKycResponse(kyc), 201);
});

export const verifyKYC = controllerWrapper(async (req: AuthRequest, res: Response) => {
  const { kycId, status, remarks } = req.body;
  const result = await KYCService.verifyKYC(kycId, status, remarks);

  return ok(res, {
    message: `KYC ${status}`,
    kyc: result.kyc,
    user: result.user,
  });
});

export const DeleteKYCDocument = controllerWrapper(async (req: AuthRequest, res: Response) => {
  const { kycId, documentId } = req.params;
  const result = await KYCService.deleteKYCDocument(kycId, documentId);
  return ok(res, result);
});

export const getKycById = controllerWrapper(async (req: AuthRequest, res: Response) => {
  const kyc = await KYCService.getKycById(req.params.kycId);
  return ok(res, kyc);
});
