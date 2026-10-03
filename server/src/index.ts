import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import releaseRoutes from './routes/release.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/releases', releaseRoutes);

if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from .env');
}

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully');

        // Start server after successful DB connection
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);

    });
