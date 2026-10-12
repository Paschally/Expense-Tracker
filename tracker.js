const express = require('express');
require('dotenv').config();
const db_connect = require('./database/db');
const dns = require('dns');
const authRoute = require('./routes/userRoute')

const app = express();
const port = process.env.PORT || 5500;
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Connnect to db
db_connect();

// middleware
app.use(express.json());

app.get('/home', (req, res) => {
    res.send("Welcome to your Expense Tracker")
});

app.use('/tracker/auth', authRoute);

app.listen(port, ()=>{
    console.log(`Server is listening on port: ${port}`)
});