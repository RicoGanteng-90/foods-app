import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    province: String,
    country: String,
  },
  { _id: false, strict: 'throw' }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: '', trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    address: addressSchema,
    refreshTokens: [
      {
        token: { type: String, index: true },
        tokenFamily: { type: String, index: true },
        device: String,
        ip: String,
        createdAt: Date,
        expiresAt: Date,
      },
    ],
  },
  { strict: 'throw', timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
