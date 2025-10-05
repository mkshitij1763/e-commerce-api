require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// connect to MongoDB before starting server
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
