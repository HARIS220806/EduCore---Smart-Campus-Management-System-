require('dotenv').config();
const path = require('path');

module.exports = {
  port: process.env.PORT || 5005,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  clientOrigin: process.env.CLIENT_ORIGIN 
    ? process.env.CLIENT_ORIGIN.split(',').map(s => s.trim()) 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://24104059_db_user:Haris1234@cluster0.lwnd4yg.mongodb.net/smart-campus?appName=Cluster0',
  dbFile: process.env.DB_FILE || (process.env.VERCEL ? path.join('/tmp', 'db.json') : path.join(__dirname, '..', 'data', 'db.json')),
};
