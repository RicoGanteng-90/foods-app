import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedFoods } from './src/seeders/foodSeeder.js';
dotenv.config();

const runSeeder = async () => {
  try {
    console.log('Menghubungkan ke Database...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Database Terhubung! 🚀');

    await seedFoods(55);

    console.log('Seeding selesai, memutus koneksi...');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Terjadi kesalahan saat seeding:', err);
    process.exit(1);
  }
};

runSeeder();
