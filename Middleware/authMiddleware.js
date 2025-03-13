const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "Access denied! No token provided." });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_KEY);
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token!" });
    }
};

module.exports={verifyToken};