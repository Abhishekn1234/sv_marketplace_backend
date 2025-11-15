import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, 
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify()
  .then(() => console.log("✅ SMTP ready (SSL 465)"))
  .catch(err => console.error("❌ SMTP connection failed:", err));

export const sendOtp = async (email: string, otp: string) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is: <b>${otp}</b>. It expires in 10 minutes.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP sent:", info.messageId);
  } catch (err) {
    console.error("Failed to send OTP:", err);
    throw new Error("Could not send OTP");
  }
};

