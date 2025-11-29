import { mailTransporter } from "./emailtransport";

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  return mailTransporter.sendMail(mailOptions);
};
