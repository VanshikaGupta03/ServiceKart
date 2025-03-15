const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const {verifyToken}=require('../Middleware/authMiddleware');
const cartController=require('../controllers/Cart');
const orderController=require("../controllers/order");

router.get('/fetch', verifyToken,productController.getProducts);
router.post('/add',verifyToken,cartController.addToCart);
router.post('/remove',verifyToken,cartController.removeFromCart);
router.get("/getCart", verifyToken, cartController.getCart);
router.post("/orderPlace",verifyToken,orderController.orderPlace);

module.exports = router;
