const mongoose = require('mongoose');
const { seedDatabase, syncInMemoryStore } = require('./seedDatabase');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_file_db', {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected successfully to database: ${conn.connection.name} on host: ${conn.connection.host}`);
    
    // Auto-seed database with teachers (Ezhilarasi, Priyadharshini, Ganesh kumar, Nagul), subjects, timetables & attendance
    syncInMemoryStore();
    await seedDatabase();

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
