export const mergeMulterFiles = (
  filesObj: Record<string, Express.Multer.File[]> | undefined
): Express.Multer.File[] => {

  const filesArray: Express.Multer.File[] = [];

  if (!filesObj) return filesArray;

  Object.values(filesObj).forEach((arr) => {
    filesArray.push(...arr);
  });

  return filesArray;
};

export function mapFileToKYC(files: Express.Multer.File[]) {
  return files.map(file => ({
    category: file.fieldname,
    documentType: file.fieldname,
    fileName: file.originalname,
    filePath: file.path,
    fileType: file.mimetype,
    uploadedAt: new Date(),
    publicId:file.filename
  }));
}

