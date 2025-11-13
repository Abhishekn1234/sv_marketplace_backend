import nodemailer from "nodemailer";

// Load env variables
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,        // smtp.gmail.com
  port: 465,                          // SSL port
  secure: true,                        // use SSL
  auth: {
    user: process.env.SMTP_USER,      // your email
    pass: process.env.SMTP_PASS,      // Gmail App Password
  },
});

// Optional: verify transporter connection
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
