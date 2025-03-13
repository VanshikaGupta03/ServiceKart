const express = require("express");
const upload=require("../Config/Multer") 
const { registerUser } = require("../controllers/users");
//const { verifyToken } = require("../Middleware/authMiddleware");

const {updateProfile}=require("../controllers/users");
const {deleteProfile}=require("../controllers/users");

const router = express.Router();


router.post("/profile",upload.single("profileImage"),  registerUser);

router.put("/update", upload.single("profileImage"), updateProfile);
router.delete("/delete", deleteProfile);
module.exports = router;