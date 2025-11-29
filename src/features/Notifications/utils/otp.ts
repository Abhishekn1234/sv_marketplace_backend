export const createOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expire = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, expire };
};

export const isOtpExpired = (expire: Date) => expire < new Date();
