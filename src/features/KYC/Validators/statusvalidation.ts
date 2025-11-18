export const validateKYCSubmissionstatus = (overallStatus: string, userKYCStatus: string) => {
  if (overallStatus === "pending" || userKYCStatus === "pending") {
    throw new Error("KYC is already pending and cannot be submitted again");
  }
};