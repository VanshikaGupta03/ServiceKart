const express = require("express");
const {addAddress,getAddresses,updateAddress,deleteAddress} = require("../controllers/address");
const { verifyToken } = require("../Middleware/authMiddleware");
const router = express.Router();


router.post("/adding",verifyToken, addAddress);
router.get("/address",verifyToken,getAddresses);
router.put("/update/:address_id", verifyToken,updateAddress);
router.delete("/delete/:address_id",verifyToken, deleteAddress);

module.exports = router;