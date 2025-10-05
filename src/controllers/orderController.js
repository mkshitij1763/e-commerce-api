const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// POST /api/orders/checkout
exports.checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price stock')
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // ✅ check stock for each item
    for (const item of cart.items) {
      if (!item.productId) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ message: 'Some products no longer exist' });
      }
      if (item.productId.stock < item.quantity) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ message: `Insufficient stock for ${item.productId.name}` });
      }
    }

    // ✅ decrement stock
    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.productId._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // ✅ build order
    const orderItems = cart.items.map(i => ({
      productId: i.productId._id,
      name: i.productId.name,
      price: i.productId.price,
      quantity: i.quantity
    }));
    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create([{
      userId,
      items: orderItems,
      total,
      status: 'pending'
    }], { session });

    // ✅ empty the cart
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Order placed', order: order[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/orders  (user)
exports.getMyOrders = async (req, res) => {
  try {
    // req.user.id comes from JWT (set in authMiddleware)
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



// GET /api/orders/all  (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/orders/:id/status  (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status || order.status;
    await order.save();

    res.json({ message: 'Status updated', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.payOrder = async (req, res) => {
  try {
    const { id } = req.params;                 // order id
    const { paymentRef } = req.body;

    if (!paymentRef || typeof paymentRef !== 'string' || paymentRef.trim().length < 4) {
      return res.status(400).json({ message: 'Valid paymentRef required (min 4 chars)' });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // only owner or admin
    const isOwner = order.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not allowed' });

    if (order.isPaid) return res.status(400).json({ message: 'Order already paid' });
    if (order.status !== 'pending') return res.status(400).json({ message: 'Only pending orders can be paid' });

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentRef = paymentRef.trim();
    order.status = 'paid';
    await order.save();

    res.json({ message: 'Payment recorded', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

