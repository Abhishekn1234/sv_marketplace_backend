export const resetPasswordEmail = (name: string, url: string) => `
  <h2>Password Reset Request</h2>
  <p>Hello ${name}, click the button below to reset your password:</p>
  <a href="${url}" style="background:#007bff;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Reset Password</a>
  <p>This link expires in 1 hour.</p>
`;

export const passwordResetSuccessEmail = (name: string) => `
  <h2>Password Reset Successful</h2>
  <p>Hello ${name}, your password has been reset successfully.</p>
  <p>If you did not request this change, contact support immediately.</p>
`;
