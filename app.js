const express = require('express');
const cors = require('cors');
//const helmet = require('helmet');
//const morgan = require('morgan');
//const errorHandler = require('./middleware/errorHandler');

const app = express();

//app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes'));

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

module.exports = app;