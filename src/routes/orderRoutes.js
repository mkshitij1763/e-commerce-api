const express = require('express');
const router = express.Router();
const {
  checkout, getMyOrders, getAllOrders, updateOrderStatus, payOrder
} = require('../controllers/orderController');
const auth = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/adminMiddleware');

router.post('/checkout', auth, checkout);
router.post('/:id/pay', auth, payOrder);             
router.get('/', auth, getMyOrders);
router.get('/all', auth, isAdmin, getAllOrders);
router.patch('/:id/status', auth, isAdmin, updateOrderStatus);

module.exports = router;
