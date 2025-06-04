import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    image: {
      type: {
        url: {
          type: String,
          required: [true, "Category image URL is required"],
        },
        public_id: {
          type: String,
          required: [true, "Category image public ID is required"],
        },
      },
      required: [true, "Category image is required"],
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
      trim: true,
    },
    isListed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for product count
categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

const Category = mongoose.model("Category", categorySchema);

export default Category;