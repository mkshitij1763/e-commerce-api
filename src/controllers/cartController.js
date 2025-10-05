const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart  (protected)
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      'items.productId',
      'name price'
    );

    if (!cart) return res.json({ cart: { userId: req.user.id, items: [] } });
    res.json({ cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/cart/add  (protected)
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity == null)
      return res.status(400).json({ message: 'productId and quantity required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      i => i.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    const populatedCart = await cart.populate('items.productId', 'name price');

    res.status(200).json({ message: 'Item added to cart', cart: populatedCart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/cart/remove  (protected)
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res.status(400).json({ message: 'productId required' });

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      i => i.productId.toString() !== productId
    );

    await cart.save();

    const populatedCart = await cart.populate('items.productId', 'name price');

    res.json({ message: 'Item removed', cart: populatedCart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
