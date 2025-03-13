const express = require('express');
const router = express.Router();
const CardController = require('../controllers/Card');
const { verifyToken } = require('../Middleware/authMiddleware')

router.post('/add',verifyToken, CardController.addCard);
router.get('/list', verifyToken,CardController.getCards);
router.put('/edit/:cardId',verifyToken,CardController.updateCard);
router.delete('/delete/:cardId',verifyToken, CardController.deleteCard);

module.exports = router;