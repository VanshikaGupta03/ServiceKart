const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const {verifyToken}=require('../Middleware/authMiddleware');
const cartController=require('../controllers/Cart');

router.get('/fetch', verifyToken,productController.getProducts);
router.post('/add',verifyToken,cartController.addToCart);
router.post('/remove',verifyToken,cartController.removeFromCart);

module.exports = router;
