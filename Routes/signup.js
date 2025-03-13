const express = require('express')

const controllers=require("../controllers/signup");
const {resetRequest, verifyOtp}=require("../controllers/resetPassword");
const router = express.Router();

router.post('/signup', controllers.signup);

router.post('/resetRequest',resetRequest);
router.post('/verifyOtp',verifyOtp);

module.exports=router;