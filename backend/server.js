require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const pool = require("./db/pool");

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Radhey Mart API is running' }));

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/orders", require("./routes/orderRoutes"));

app.use(errorHandler);
pool.query("SELECT NOW()")
  .then((r) => console.log("DB Ping OK:"))
  .catch((e) => console.error("DB Ping Failed:", e.message));

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "Radhey Mart API is running" })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
