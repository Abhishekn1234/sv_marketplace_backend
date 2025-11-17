import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Gmail SMTP server
  port: 587,              // Hardcoded STARTTLS port
  secure: false,          // STARTTLS, not SSL
  auth: {
    user: process.env.EMAIL_USER,      // Your Gmail address
    pass: process.env.EMAIL_PASS       // Gmail App Password
  },
});

// Verify connection
transporter.verify()
  .then(() => {
    console.log("✅ SMTP ready on smtp.gmail.com:587 (STARTTLS)");
  })
  .catch(err => {
    console.error("❌ SMTP connection failed:", err);
  });

// Function to send OTP
export const sendOtp = async (email: string, otp: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // sender email
      to: email,                    // recipient
      subject: "Your OTP Code",
      html: `<p>Your OTP code is: <b>${otp}</b>. It expires in 10 minutes.</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP sent:", info.messageId);
  } catch (err) {
    console.error("Failed to send OTP:", err);
    throw new Error("Could not send OTP");
  }
};
