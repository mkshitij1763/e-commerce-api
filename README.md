# e-commerce-api
perfect 💪 — here’s a **clean, professional, in-depth README.md** written in full Markdown, ready to paste directly into your GitHub repo.
It’s comprehensive but still elegant — written the way technical leads and recruiters expect.

---

```markdown
# 🛍️ E-Commerce REST API (Node.js + Express + MongoDB)

A full-stack-ready **E-Commerce backend API** built using **Node.js**, **Express**, and **MongoDB (Atlas)**.  
It provides all core e-commerce features — user authentication, role-based access, product management, cart, orders, and simulated payments — with production-grade security, validation, and logging.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Runtime | **Node.js** |
| Framework | **Express.js** |
| Database | **MongoDB Atlas** (via **Mongoose**) |
| Authentication | **JWT (JSON Web Tokens)** |
| Password Hashing | **bcryptjs** |
| Security | **helmet**, **xss-clean**, **express-mongo-sanitize**, **hpp**, **express-rate-limit** |
| Logging | **morgan** (dev) + **winston** (structured logs) |
| Validation | **express-validator** (optional step) |
| Transactions | **MongoDB sessions** for atomic stock updates |

---

## 🧩 Features Overview

### 👥 User & Authentication
- Register, login, and profile retrieval (`/api/users/register`, `/api/users/login`, `/api/users/me`)
- Passwords hashed using bcrypt
- JWT-based authentication with 1-hour expiry
- Role-based authorization (`user` / `admin`)

### 🛒 Products
- Public: View all products or single product by ID
- Admin: Create, update, or delete products
- Stock management and atomic decrement on checkout

### 🧺 Cart
- Add or remove products from cart
- Automatically linked to user via JWT
- Cart stored in MongoDB per user

### 📦 Orders
- Checkout from cart → creates an order
- Validates product stock before order creation
- Automatically clears cart after successful checkout
- Admin can view all orders and update status (`pending → shipped → delivered`)

### 💳 Simulated Payments
- Mark orders as **paid** with `paymentRef`
- Captures payment time (`paidAt`) and sets `isPaid: true`
- Prevents duplicate or invalid payment attempts

### 🛡️ Security Features
- **Helmet:** secure HTTP headers  
- **Rate-limiting:** throttles excessive requests per IP  
- **Mongo sanitize:** prevents NoSQL injection (`$` and `.` operators)  
- **XSS clean:** blocks XSS payloads in request data  
- **HPP:** prevents HTTP parameter pollution attacks  
- **JWT middleware:** strict authorization checks  

### 🧾 Logging & Error Handling
- **morgan** for request logs in development
- **winston** for structured production logs
- Centralized 404 and error middleware

### ⚡ Performance & Transactions
- MongoDB **transactions** guarantee atomic stock updates during checkout
- Lean `find()` and projections for faster queries
- Indexed `_id` and referenced relationships (`User`, `Product`, `Cart`, `Order`)

---

## 📂 Project Structure

```

src/
├── app.js                    # Express app setup (middlewares, routes, security)
├── server.js                 # Entry point - connects to DB and starts server
│
├── config/
│   └── db.js                 # MongoDB connection logic
│
├── controllers/              # Business logic
│   ├── userController.js
│   ├── productController.js
│   ├── cartController.js
│   └── orderController.js
│
├── middlewares/              # Custom middleware
│   ├── authMiddleware.js     # JWT verification
│   ├── adminMiddleware.js    # Role-based access control
│   └── errorHandler.js       # Global error + 404 handler
│
├── models/                   # Mongoose schemas
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
│
├── routes/                   # API route definitions
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   └── orderRoutes.js
│
└── utils/
└── logger.js             # Winston logger config

```

---

## 🚀 Core API Endpoints

### Auth & Users
| Method | Endpoint | Description | Auth |
|--------|-----------|-------------|------|
| `POST` | `/api/users/register` | Register new user | Public |
| `POST` | `/api/users/login` | Login & receive JWT | Public |
| `GET` | `/api/users/me` | Get current user info | Auth |

---

### Products
| Method | Endpoint | Description | Auth |
|--------|-----------|-------------|------|
| `GET` | `/api/products` | List all products | Public |
| `GET` | `/api/products/:id` | Get product details | Public |
| `POST` | `/api/products` | Add new product | Admin |
| `PUT` | `/api/products/:id` | Update product | Admin |
| `DELETE` | `/api/products/:id` | Delete product | Admin |

---

### Cart
| Method | Endpoint | Description | Auth |
|--------|-----------|-------------|------|
| `GET` | `/api/cart` | Get user cart | User |
| `POST` | `/api/cart/add` | Add item to cart | User |
| `POST` | `/api/cart/remove` | Remove item from cart | User |

---

### Orders
| Method | Endpoint | Description | Auth |
|--------|-----------|-------------|------|
| `POST` | `/api/orders/checkout` | Create order from cart | User |
| `POST` | `/api/orders/:id/pay` | Mark order as paid (simulate) | User/Admin |
| `GET` | `/api/orders` | List own orders | User |
| `GET` | `/api/orders/all` | View all orders | Admin |
| `PATCH` | `/api/orders/:id/status` | Update order status | Admin |

---

## 🔐 JWT Flow

1. **Register / Login** → returns JWT (`id`, `email`, `role`)  
2. All protected routes include:
```

Authorization: Bearer <token>

````
3. Middleware verifies token → attaches `req.user`  
4. Admin-only routes use both `authMiddleware` and `adminMiddleware`

---

## 💡 Transaction Logic for Checkout

Checkout uses **MongoDB sessions** for atomic updates:
1. Start transaction  
2. Validate product stock for all items  
3. Decrement product stock  
4. Create order document  
5. Clear cart  
6. Commit transaction  

If **any step fails**, the transaction is aborted — stock and data remain unchanged.

---

## 🧪 Key Security Validations

| Type | Library | Protection |
|------|----------|-------------|
| HTTP Headers | helmet | Prevent clickjacking, XSS, MIME sniffing |
| Rate Limiting | express-rate-limit | Prevent brute force / DoS |
| NoSQL Injection | express-mongo-sanitize | Strip `$` and `.` from input |
| XSS | xss-clean | Remove malicious HTML/JS |
| HPP | hpp | Stop query parameter pollution |
| Auth | JWT + bcrypt | Secure authentication & password storage |

---

## 📦 Example Workflows

### Register → Login → Add Product → Checkout → Pay
1. **Register user** → `/api/users/register`
2. **Login** → get `token`
3. **Admin adds product** → `/api/products` (Bearer admin token)
4. **User adds to cart** → `/api/cart/add`
5. **Checkout** → `/api/orders/checkout`
6. **Pay order** → `/api/orders/:id/pay`
7. **Admin updates status** → `/api/orders/:id/status`

---

```
