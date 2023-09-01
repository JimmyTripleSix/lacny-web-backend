require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const mongoConnection = process.env.DATABASE_URL;


mongoose.connect(mongoConnection);
const db = mongoose.connection;

db.on('error', (error) => {
    console.log(error);
})

db.once('connected', () => {
    console.log('Database Connected');
})
const app = express();

app.use(express.json());

app.listen(8066, () => {
    console.log(`Server Started at ${8066}`);
})

const routes = require('./routes/routes');
app.use('/api', routes);