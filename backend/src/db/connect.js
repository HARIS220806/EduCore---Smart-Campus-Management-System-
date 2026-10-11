const mongoose = require('mongoose');
const config = require('../config');

async function connectDB() {
  try {
    const uri = config.mongoUri;
    console.log(`Connecting to MongoDB at: ${uri}`);
    await mongoose.connect(uri);
    console.log('MongoDB connection established successfully!');
  } catch (err) {
    console.warn(`MongoDB connection notice: ${err.message}. (Falling back to persistent JSON storage if MongoDB is offline).`);
  }
}

module.exports = connectDB;
