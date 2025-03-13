const db = require("../database");

const createUserOrUpdateOTP = (email, otp, otpExpires, callback) => {
    db.query(
        `INSERT INTO users (email, otp, otp_expires) VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE otp=?, otp_expires=?`,
        [email, otp, otpExpires, otp, otpExpires],
        callback
    );
};

const findUserByOTP = (email, otp, callback) => {
    db.query(
        "SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expires > NOW()",
        [email, otp],
        callback
    );
};

const verifyUser = (email, callback) => {
    db.query(
        "UPDATE users SET is_verified = TRUE WHERE email = ?",
        [email],
        callback
    );
};

module.exports = { createUserOrUpdateOTP, findUserByOTP, verifyUser };
