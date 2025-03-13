const db = require("../database");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = async (req, res) => {
    try {
        console.log("Login Request Body:", req.body);

        const { email } = req.body;

        
        if (!email || !email.includes("@")) {
            return res.status(400).json({ message: "Valid email is required!" });
        }

     
        const [userResult] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (userResult.length === 0) {
            return res.status(401).json({ message: "User not found! Please sign up first." });
        }

        const user = userResult[0];

        if (!user.is_verified) {
            return res.status(401).json({ message: "Email is not verified. Please verify OTP." });
        }

        
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_KEY,
            { expiresIn: "7d" } 
        );

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
            },
            token
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
