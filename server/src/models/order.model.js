import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    addressNote: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderItems: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Food',
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    orderNote: String,
    deliveryAddress: deliverySchema,
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cooking', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    total: { type: Number, required: true },
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
