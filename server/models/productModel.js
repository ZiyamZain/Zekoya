import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    enum: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
  },
  stock: {
    type: Number,
    required: true,
    min: [0, "Stock cannot be negative"],
  }
}, { _id: false }); 

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          public_id: {
            type: String,
            required: true,
          },
        },
      ],
      required: [true, "At least 3 product images are required"],
      validate: {
        validator: function (v) {
          return v.length >= 3;
        },
        message: "Product must have at least 3 images",
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    sizes: {
      type: [sizeSchema],
      required: [true, "At least one size must be specified"],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "Product must have at least one size available",
      },
    },
    totalStock: {
      type: Number,
      default: 0,
    },
    isListed: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware to calculate totalStock before saving
productSchema.pre('save', function(next) {
  this.totalStock = this.sizes.reduce((total, size) => total + size.stock, 0);
  next();
});

// Create indexes for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ isListed: 1 });


const Product = mongoose.model("Product", productSchema);

export default Product;