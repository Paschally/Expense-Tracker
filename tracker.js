import express from 'express';
import dotenv from 'dotenv';
import dns from 'dns';

import db_connect from './database/db.js';
import userRoute from './routes/userRoute.js';
import transactionRoute from './routes/transactionRoute.js';
import categoryRoute from './routes/categoryRoute.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5500;

// Configure DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Connect to database
db_connect();

// Middleware
app.use(express.json());

// Home route
app.get('/home', (req, res) => {
    res.send('Welcome to your Expense Tracker');
});

// API routes
app.use('/api/auth', userRoute);
app.use('/api/transactions', transactionRoute);
app.use('/api/categories', categoryRoute);

// Start server
app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
});
