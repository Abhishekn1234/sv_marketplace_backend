export const ok = (res: any, data: any, status = 200) => {
  return res.status(status).json(data);
};

export const badRequest = (res: any, message: string) => {
  return res.status(400).json({ message });
};

export const unauthorized = (res: any, message = "User not authenticated") => {
  return res.status(401).json({ message });
};

export const notFound = (res: any, message: string) => {
  return res.status(404).json({ message });
};
