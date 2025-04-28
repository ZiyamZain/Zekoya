import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import userAuthRoutes from "./routes/userAuthRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

import adminProductRoutes from "./routes/adminProductRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import passport from "passport";
import { passportConfig } from "./config/passport.js"; // Correctly import named export
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());
passportConfig(); // Apply the passport configuration (use the passport strategies)

// Serve static files from the uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Sample route
app.get("/", (req, res) => {
  res.send("API is working!");
});

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/users", userAuthRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/categories", categoryRoutes);

app.use("/api/admin/products", adminProductRoutes);
app.use("/api/products", productRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  console.error("Error Stack:", err.stack);
  console.error("Request Body:", req.body);
  console.error("Request Files:", req.files);
  console.error("Request Headers:", req.headers);
  
  // If it's a validation error, send a 400 status
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map(error => error.message)
    });
  }

  // If it's a custom error with status code, use that
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Default to 500 for other errors
  res.status(500).json({ 
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Server Port
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
