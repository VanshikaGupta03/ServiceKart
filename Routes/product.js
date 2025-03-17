const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const {verifyToken}=require('../Middleware/authMiddleware');
const cartController=require('../controllers/Cart');
const orderController=require("../controllers/order");
const ratingController=require("../controllers/rating");

router.get('/fetch', verifyToken,productController.getProducts);
router.post('/add',verifyToken,cartController.addToCart);
router.post('/remove',verifyToken,cartController.removeFromCart);
router.get("/getCart", verifyToken, cartController.getCart);
router.post("/orderPlace",verifyToken,orderController.orderPlace);
router.post('/cancelOrder',verifyToken,orderController.cancelOrder);
router.get('/getOrder',verifyToken,orderController.getOrders);

router.post('/addRating',verifyToken,ratingController.addRating);
router.post('/getRating',verifyToken,ratingController.getProductRatings);
module.exports = router;
