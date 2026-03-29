import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import connectDB from './config/db.js';
import foodRoute from './routes/food.route.js';
import categoryRoute from './routes/category.route.js';
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import cartRoute from './routes/cart.route.js';
import orderRoute from './routes/order.route.js';
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/AppError.js';

connectDB();

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: process.env.PUBLIC_API_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Routes
app.use('/api/foods', foodRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/carts', cartRoute);
app.use('/api/orders', orderRoute);

//404 Catch-all
app.use((req, res, next) => {
  next(
    new AppError(`Cannot ${req.method} ${req.path}`, {
      type: 'warn',
      caution: 'The route you requested does not exist',
      code: 'NOT_FOUND',
      context: { method: req.method, path: req.path },
    })
  );
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server rocketing at ${process.env.SERVER_URL}:${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('[undhandledRejection]', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  server.close(() => process.exit(1));
});
