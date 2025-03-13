const db=require('../database');
const transporter=require('../Config/Email');
const { createUserOrUpdateOTP, findUserByOTP,verifyUser } = require("../Models/User");

const sendOTP = async (email) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is: ${STATIC_OTP}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) reject(error);
            else resolve(info.response);
        });
    });
};
const STATIC_OTP = "123456"; 
exports.signup = async (req, res) => {
    const { email } = req.body;


    

    if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Invalid email address" });
    }

    try {
        const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        const otpExpires = new Date(Date.now() + 10 * 60000); 

        if (existingUser.length > 0) {
            const user = existingUser[0];

            if (user.is_verified) {
                return res.status(400).json({ error: "User already registered. Please log in." });
            }
        }

      
        await createUserOrUpdateOTP(email, STATIC_OTP, otpExpires);

      
        await sendOTP(email);

        console.log("Sending response now...");
        return res.status(200).json({ 
            message: "OTP sent successfully", 
            user: { email, otp: STATIC_OTP, otpExpires }  
        });

    } catch (error) {
        console.error("Error occurred:", error);
        return res.status(500).json({ error: "Database error", details: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    console.log("Received request to verify OTP:", email, otp); // Debugging

    if (!email || !otp) {
        console.log("Missing email or OTP");
        return res.status(400).json({ error: "Email and OTP are required" });
    }

    try {
        findUserByOTP(email, otp, async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error", details: err.message });
            }

            console.log("Database query results:", results);

            if (results.length === 0) {
                console.log("Invalid or expired OTP");
                return res.status(400).json({ error: "Invalid or expired OTP" });
            }

            verifyUser(email, async (err) => {
                if (err) {
                    console.error("Failed to verify user:", err);
                    return res.status(500).json({ error: "Failed to verify user" });
                }

                console.log("User verified successfully");
                return res.status(200).json({ message: "User verified successfully" });
            });
        });
    } catch (error) {
        console.error("Unexpected server error:", error);
        return res.status(500).json({ error: "Server error", details: error.message });
    }
};
