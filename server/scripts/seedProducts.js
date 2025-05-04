// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import Product from '../models/productModel.js';
// import Category from '../models/categoryModel.js';

// dotenv.config();

// const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zekoya';

// async function seedProducts() {
//   await mongoose.connect(MONGO_URI);
//   const categories = await Category.find({ isListed: true });
//   if (!categories.length) {
//     console.log('No categories found. Seed categories first.');
//     process.exit(1);
//   }
//   const sampleCategory = categories[0]._id;

//   const products = [
//     {
//       name: 'Test Jersey',
//       description: 'A premium test football jersey.',
//       price: 99.99,
//       images: [
//         '/uploads/sample1.jpg',
//         '/uploads/sample2.jpg',
//         '/uploads/sample3.jpg',
//       ],
//       category: sampleCategory,
//       sizes: [
//         { size: 'M', stock: 10 },
//         { size: 'L', stock: 5 }
//       ],
//       totalStock: 15,
//       isListed: true,
//       isFeatured: true,
//     },
//     {
//       name: 'Retro Jersey',
//       description: 'A classic retro football jersey.',
//       price: 79.99,
//       images: [
//         '/uploads/sample4.jpg',
//         '/uploads/sample5.jpg',
//         '/uploads/sample6.jpg',
//       ],
//       category: sampleCategory,
//       sizes: [
//         { size: 'S', stock: 7 },
//         { size: 'XL', stock: 3 }
//       ],
//       totalStock: 10,
//       isListed: true,
//       isFeatured: false,
//     }
//   ];

//   await Product.deleteMany({});
//   await Product.insertMany(products);
//   process.exit();
// }

// seedProducts().catch(e => { console.error(e); process.exit(1); });
