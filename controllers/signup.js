const db = require("../database");
const jwt = require("jsonwebtoken");

const STATIC_OTP = "123456"; 


exports.sendOtp = async (req, res) => {
    const { phone } = req.body;
    const STATIC_OTP = "123456"; 

    if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    try {
       
        const [existingUser] = await db.execute("SELECT * FROM users WHERE phone = ?", [phone]);

        if (existingUser.length > 0) {
           
            await db.execute("UPDATE users SET otp = ? WHERE phone = ?", [STATIC_OTP, phone]);
            return res.status(200).json({ message: "OTP sent successfully", phone });
        } else {
         
            await db.execute("INSERT INTO users (phone, otp) VALUES (?, ?)", [phone, STATIC_OTP]);
            return res.status(200).json({ message: "OTP sent successfully", phone });
        }
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ message: "Phone number and OTP are required" });
    }

    try {
        
        const [results] = await db.execute("SELECT * FROM users WHERE phone = ?", [phone]);

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (results[0].otp === otp) {
            
            const token = jwt.sign(
                { id: results[0].id, phone },
                process.env.JWT_KEY,
                { expiresIn: "1h" }
            );

            return res.status(200).json({ message: "OTP verified successfully", token });
        } else {
            return res.status(400).json({ message: "Invalid OTP" });
        }

    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
