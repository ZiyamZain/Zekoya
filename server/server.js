import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import userAuthRoutes from './routes/userAuthRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userProfileRoutes from './routes/userProfileRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import adminCouponRoutes from './routes/adminCouponRoutes.js';
import userCouponRoutes from './routes/userCouponRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminProductRoutes from './routes/adminProductRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminOfferRoutes from './routes/adminOfferRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'https://zekoya.shop',    // Your production domain
  'https://www.zekoya.shop' // Your production domain with www
  // Add other origins if needed, e.g., staging environment
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.get('/', (req, res) => {
  res.send('API is working!');
});

app.use('/api/admin', adminRoutes);
app.use('/api/users', userAuthRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users/profile', userProfileRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/coupons', adminCouponRoutes);
app.use('/api/coupons', userCouponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin/offers', adminOfferRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin/reports', reportRoutes);

app.use((err, req, res, _next) => {
  console.error('Server Error:', err);
  console.error('Error Stack:', err.stack);
  console.error('Request URL:', req.originalUrl);
  console.error('Request Method:', req.method);
  console.error('Request Body:', req.body);
  console.error('Request Files:', req.files);
  console.error('Request Headers:', req.headers);

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      error: err.message,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map((error) => error.message),
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  res.status(500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
