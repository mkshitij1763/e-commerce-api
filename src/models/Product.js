// // simple structure kept in our JSON "DB"
// class Product {
//   constructor({ name, price, description, category, stock }) {
//     this.id = Date.now().toString();
//     this.name = name;
//     this.price = price;
//     this.description = description || '';
//     this.category = category || 'general';
//     this.stock = stock ?? 0;
//     this.createdAt = new Date().toISOString();
//   }
// }

// module.exports = Product;

const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: String,
  stock: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
