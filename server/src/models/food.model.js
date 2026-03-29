import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    comment: { type: String, required: [true, 'Review comment is required'] },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

const FoodSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    stock: {
      type: Number,
      required: [true, 'Food quantity is required'],
      min: 0,
    },
    imageUrl: String,
    imagePublicId: String,
    price: { type: Number, required: [true, 'Food price is required'], min: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Food category is required'],
    },
    isAvailable: { type: Boolean, default: true },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

const Food = mongoose.model('Food', FoodSchema);

export default Food;
