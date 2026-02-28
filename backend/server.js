require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes'); // ✅ add

const app = express();

// ✅ Allow Vercel + localhost (and any other origin you set as CLIENT_URL)
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL, // e.g. https://radhey-mart.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow tools like Postman/curl (no origin)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'Radhey Mart API is running' })
);

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes); // ✅ add

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
