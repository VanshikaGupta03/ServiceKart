require("dotenv").config();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const db = require("../database"); 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});


const users = {}; 
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


exports.resetRequest = async (req, res) => {
  try {
    const { email } = req.body;

  
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (user.length === 0) {
      return res.status(400).json({ message: "You are not allowed to request an OTP" });
    }

   
    const otp = generateOTP();
    users[email] = { otp, expires: Date.now() + 300000 }; 

   
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It expires in 5 minutes.`,
    };

    
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({ message: "Email not sent", error });
      }
      res.json({ message: "OTP sent to email" });
    });
  } catch (error) {
    console.error("OTP Request Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    
    const userOtpData = users[email];
    if (!userOtpData || userOtpData.otp !== otp || Date.now() > userOtpData.expires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

   
    const hashedPassword = await bcrypt.hash(newPassword, 10);

  
    await db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);

   
    delete users[email];

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
