import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465", // true only for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify()
  .then(() => console.log(`✅ SMTP ready (${transporter ? 'SSL 465' : 'STARTTLS 587'})`))
  .catch(err => console.error("❌ SMTP connection failed:", err));

export const sendOtp = async (email: string, otp: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
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
