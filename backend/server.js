const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/academic', require('./routes/academicRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Online',
    service: 'College 3-Tier File & User Management API with Core Modules',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 College Management API Server running on http://0.0.0.0:${PORT}`);
  console.log(`🛡️ Roles Configured: HOD | Staff | Student`);
  console.log(`📚 Core Modules Mounted: Subjects, Timetable Grid, Attendance, Feedback`);
  console.log(`=======================================================`);
});
