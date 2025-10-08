const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const passport = require('passport');
require('./config/passport'); // load strategy

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(passport.initialize());


const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'E-commerce API running' });
});


module.exports = app;
