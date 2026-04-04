import { faker } from '@faker-js/faker';
import Food from '../models/food.model.js';
import Category from '../models/category.model.js';

export const seedFoods = async (count = 10) => {
  try {
    const categories = await Category.find();

    if (categories.length === 0) {
      throw new Error('Database kategori kosong! Silakan seed kategori dulu.');
    }

    await Food.deleteMany();

    const foods = [];

    for (let i = 0; i < count; i++) {
      foods.push({
        name: faker.food.dish(),
        description: faker.food.description(),
        price: faker.number.int({ min: 10000, max: 100000 }),
        stock: faker.number.int({ min: 1, max: 50 }),
        category: faker.helpers.arrayElement(categories)._id,
        image: faker.image.url({ category: 'food' }),
        createdAt: faker.date.past(),
      });
    }

    await Food.insertMany(foods);
    console.log(`✅ ${count} Food data Seeded successfully!`);
  } catch (err) {
    console.error('Error seeding data: ❌', err.message);
  }
};
