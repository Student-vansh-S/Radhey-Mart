const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');

router.post('/add', addToCart);
router.get('/:userId', getCart);
router.patch('/item/:id', updateCartItem);
router.delete('/item/:id', removeCartItem);
router.delete('/clear/:userId', clearCart);

module.exports = router;
