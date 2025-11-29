export const otpEmailTemplate = (name: string, otp: string) => `
  <h2>Email Verification OTP</h2>
  <p>Hello ${name}, your verification OTP is:</p>
  <h3>${otp}</h3>
  <p>This OTP is valid for 10 minutes.</p>
`;
