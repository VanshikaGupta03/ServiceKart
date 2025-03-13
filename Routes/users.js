const express = require("express");
const upload=require("../Config/Multer") 
const { registerUser } = require("../controllers/users");


const {updateProfile}=require("../controllers/users");
const {deleteProfile}=require("../controllers/users");
const { verifyToken } = require("../Middleware/authMiddleware");

const router = express.Router();


router.post("/profile",upload.single("profileImage"),verifyToken,  registerUser);

router.put("/update", upload.single("profileImage"),verifyToken, updateProfile);
router.delete("/delete", verifyToken,deleteProfile);
module.exports = router;