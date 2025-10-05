
# 🛍️ E-Commerce API (Node.js + Express + MongoDB)

A full-featured backend API for an e-commerce platform built with **Node.js**, **Express**, and **MongoDB (Atlas)**.  
Implements authentication, authorization, product management, cart, orders, payments simulation, and security best practices.

---

## 🚀 Features

### 👤 Authentication & Authorization
- User registration & login using **JWT**
- Role-based access (**user**, **admin**)
- Passwords hashed with **bcrypt**

### 🛒 Products
- Public: List & view product details
- Admin: Create, update, delete products
- Stock management with automatic decrement on checkout

### 🧺 Cart
- Add / remove items from cart
- Linked to each authenticated user
- Auto-clears after successful checkout

### 📦 Orders
- Create orders from cart
- View user orders
- Admin can view all orders & update statuses
- Simulated payment: mark order as “paid” with payment reference

---

## 🏗️ Project Structure

```

src/
├── app.js                     # Express app & middleware
├── server.js                  # Entry point
├── config/
│   └── db.js                  # MongoDB connection (Mongoose)
├── controllers/
│   ├── userController.js
│   ├── productController.js
│   ├── cartController.js
│   └── orderController.js
├── middlewares/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
├── routes/
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   └── orderRoutes.js
└── utils/
└── logger.js

````

---

## ⚙️ Setup & Installation

### 1️⃣ Clone repo
```bash
git clone https://github.com/mkshitij1763/ecommerce-api.git
cd ecommerce-api
````

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure environment variables

Create a `.env` file in the root:

```
PORT=5000
JWT_SECRET=your-secret-key
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecommerceDB
```

### 4️⃣ Start server

```bash
npm run dev        # if using nodemon
# or
node src/server.js
```

---

## 📚 API Endpoints (Summary)

| Method | Endpoint                 | Access     | Description              |
| ------ | ------------------------ | ---------- | ------------------------ |
| POST   | `/api/users/register`    | Public     | Register new user        |
| POST   | `/api/users/login`       | Public     | Login user               |
| GET    | `/api/users/me`          | Auth       | Get own profile          |
| GET    | `/api/products`          | Public     | List products            |
| GET    | `/api/products/:id`      | Public     | Get product details      |
| POST   | `/api/products`          | Admin      | Add product              |
| PUT    | `/api/products/:id`      | Admin      | Update product           |
| DELETE | `/api/products/:id`      | Admin      | Delete product           |
| GET    | `/api/cart`              | Auth       | Get user cart            |
| POST   | `/api/cart/add`          | Auth       | Add product to cart      |
| POST   | `/api/cart/remove`       | Auth       | Remove product from cart |
| POST   | `/api/orders/checkout`   | Auth       | Checkout & create order  |
| GET    | `/api/orders`            | Auth       | Get user orders          |
| GET    | `/api/orders/all`        | Admin      | Get all orders           |
| PATCH  | `/api/orders/:id/status` | Admin      | Update order status      |
| POST   | `/api/orders/:id/pay`    | Auth/Admin | Simulate payment         |

---

## 🧪 Testing (Manual)

Use **Postman**  to:

1. Register and log in as user & admin.
2. Add products (admin).
3. Add products to cart (user).
4. Checkout → order created.
5. Admin views or updates orders.

---

## 🧰 Tech Stack

* **Node.js** + **Express**
* **MongoDB Atlas** + **Mongoose**
* **JWT** for authentication
* **bcryptjs** for password hashing
* **helmet**, **xss-clean**, **mongo-sanitize**, **hpp** for security
* **morgan** + **winston** for logging

---


