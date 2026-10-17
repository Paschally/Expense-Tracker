/*require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const app = express();
const db_connect = require('./database/db');
const authRoute = require('./routes/userRoute')
const MONGO_ATLAS = process.env.MONGO_ATLAS;
const port = process.env.PORT || 5500;*?*/

require('dotenv').config();

const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const app = require('./app');
const connectDB = require('./config/db');
const MONGO_ATLAS = process.env.MONGO_ATLAS
const PORT = process.env.PORT || 5000;

connectDB(MONGO_ATLAS)
.then(() => console.log(`🚀 Server running on port ${PORT}`))
.catch(err => console.error("Connection Error: ", err));



// Connnect to db
db_connect(MONGO_ATLAS);
// middleware
app.use(express.json());

app.get('/home', (req, res) => {
    res.send("Welcome to your Expense Tracker")
});

app.use('/tracker/auth', authRoute);

app.listen(port, ()=>{
    console.log(`Server is listening on port: ${port}`)
});