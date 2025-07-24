// Usage: node scripts/seed-products.js
import '../load-env.js';
console.log('MONGODB_URI:', process.env.MONGODB_URI);

import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import connectDB from '../src/lib/mongodb.js';

const products = [
  // Adidas
  {
    name: 'Adidas Ultraboost 21', price: 180, image: '/products/adidas1.jpeg', brand: 'Adidas', category: 'Sneakers', description: 'The Adidas Ultraboost 21 offers comfort and style for everyday wear.', inStock: true,
  },
  { name: 'Adidas NMD_R1', price: 140, image: '/products/adidas2.jpeg', brand: 'Adidas', category: 'Sneakers', description: 'Adidas NMD_R1 combines comfort and street style.', inStock: true },
  { name: 'Adidas Superstar', price: 100, image: '/products/adidas3.jpeg', brand: 'Adidas', category: 'Sneakers', description: 'Classic Adidas Superstar with iconic shell toe.', inStock: true },
  { name: 'Adidas Stan Smith', price: 95, image: '/products/adidas4.jpeg', brand: 'Adidas', category: 'Sneakers', description: 'Timeless Adidas Stan Smith tennis shoes.', inStock: true },
  { name: 'Adidas Gazelle', price: 90, image: '/products/adidas6.jpeg', brand: 'Adidas', category: 'Sneakers', description: 'Adidas Gazelle, a retro classic for everyday style.', inStock: true },
  { name: 'Adidas ZX 2K Boost', price: 150, image: '/products/adidas7.jpeg', brand: 'Adidas', category: 'Sneakers', description: 'Adidas ZX 2K Boost for modern comfort and design.', inStock: true },
  // Nike
  { name: 'Nike Air Max 90', price: 120, image: '/products/nike1.jpeg', brand: 'Nike', category: 'Sneakers', description: 'Classic Nike Air Max 90 with iconic cushioning and style.', inStock: true },
  { name: 'Nike Revolution 5', price: 95, image: '/products/nike 2.jpeg', brand: 'Nike', category: 'Sneakers', description: 'Lightweight Nike Revolution 5 for everyday running.', inStock: true },
  { name: 'Nike Downshifter 11', price: 85, image: '/products/nike 3.jpeg', brand: 'Nike', category: 'Sneakers', description: 'Nike Downshifter 11 for versatile training.', inStock: true },
  { name: 'Nike Court Vision Low', price: 110, image: '/products/nike 4.jpeg', brand: 'Nike', category: 'Sneakers', description: 'Nike Court Vision Low, inspired by classic basketball style.', inStock: true },
  { name: 'Nike Air Force 1', price: 130, image: '/products/nike 5.jpeg', brand: 'Nike', category: 'Sneakers', description: 'Legendary Nike Air Force 1 for street style.', inStock: true },
  { name: "Nike Blazer Mid '77", price: 125, image: '/products/nike 6.jpeg', brand: 'Nike', category: 'Sneakers', description: 'Vintage-inspired Nike Blazer Mid 77.', inStock: true },
  // Red Tape
  { name: 'Red Tape Classic Runner', price: 70, image: '/products/redtape 1.jpeg', brand: 'Red Tape', category: 'Sneakers', description: 'Affordable and comfortable Red Tape running shoes.', inStock: true },
  { name: 'Red Tape Urban Sneaker', price: 75, image: '/products/redtape 2.jpeg', brand: 'Red Tape', category: 'Sneakers', description: 'Red Tape Urban Sneaker for city style.', inStock: true },
  { name: 'Red Tape Mesh Trainer', price: 80, image: '/products/redtape 3.jpeg', brand: 'Red Tape', category: 'Sneakers', description: 'Breathable Red Tape Mesh Trainer.', inStock: true },
  { name: 'Red Tape Street Style', price: 85, image: '/products/redtape 4.jpeg', brand: 'Red Tape', category: 'Sneakers', description: 'Red Tape Street Style for everyday wear.', inStock: true },
  // Bacca Bucci
  { name: 'Bacca Bucci Urban Flex', price: 60, image: '/products/baccabucci 1.jpeg', brand: 'Bacca Bucci', category: 'Sneakers', description: 'Trendy Bacca Bucci sneakers for urban style.', inStock: true },
  { name: 'Bacca Bucci Street Runner', price: 65, image: '/products/baccabucci 2.jpeg', brand: 'Bacca Bucci', category: 'Sneakers', description: 'Bacca Bucci Street Runner for active days.', inStock: true },
  { name: 'Bacca Bucci Mesh Pro', price: 70, image: '/products/baccabucci 3.jpeg', brand: 'Bacca Bucci', category: 'Sneakers', description: 'Bacca Bucci Mesh Pro for breathability.', inStock: true },
  // Souled Store
  { name: 'Souled Store Classic', price: 55, image: '/products/souled store1.jpeg', brand: 'Souled Store', category: 'Sneakers', description: 'Souled Store Classic for casual comfort.', inStock: true },
  { name: 'Souled Store Urban', price: 60, image: '/products/souledsore 2.jpeg', brand: 'Souled Store', category: 'Sneakers', description: 'Souled Store Urban for city adventures.', inStock: true },
  { name: 'Souled Store Mesh', price: 65, image: '/products/souled store3.jpeg', brand: 'Souled Store', category: 'Sneakers', description: 'Souled Store Mesh for breathability.', inStock: true },
  { name: 'Souled Store Runner', price: 70, image: '/products/souled store4.jpeg', brand: 'Souled Store', category: 'Sneakers', description: 'Souled Store Runner for active lifestyles.', inStock: true },
];

async function seed() {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Products seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed(); 