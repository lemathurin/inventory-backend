import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import homeRoutes from './routes/homeRoutes';
import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/itemRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:3001', // or whatever your frontend URL is
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/api/homes', homeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/homes', itemRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Home Inventory API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});