import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // Connect to the MongoDB database
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        throw error; // Throw an error if the connection fails
    }
};

// Connect to MongoDB
connect();

// Import routes
import taxRoutes from './routes/taxRoutes.js';
app.use('/api/taxes', taxRoutes);


// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
