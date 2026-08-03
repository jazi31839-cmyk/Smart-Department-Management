const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_college_jwt_key_2026_antigravity';

// Initial pre-configured seed users (Default fallback system logins)
const defaultUsers = [
  {
    id: 'u-hod-1',
    name: 'Dr. Robert Vance (HOD)',
    email: 'hod.cs@gmail.com',
    passwordHash: bcrypt.hashSync('hod123', 10),
    role: 'HOD',
    department: 'Computer Science & Engineering',
    createdBy: 'System Root'
  },
  {
    id: 'u-staff-1',
    name: 'Prof. Sarah Jenkins',
    email: 'sarah.teacher@gmail.com',
    passwordHash: bcrypt.hashSync('staff123', 10),
    role: 'Staff',
    department: 'Computer Science & Engineering',
    createdBy: 'hod.cs@gmail.com'
  },
  {
    id: 'u-staff-2',
    name: 'Prof. Shruthi',
    email: 'shruthi.teacher@gmail.com',
    passwordHash: bcrypt.hashSync('staff123', 10),
    role: 'Staff',
    department: 'Information Technology',
    createdBy: 'hod.cs@gmail.com'
  },
  {
    id: 'u-student-1',
    name: 'Kiresh',
    email: 'kiresh.student@gmail.com',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'Student',
    department: 'Information Technology',
    createdBy: 'shruthi.teacher@gmail.com'
  },
  {
    id: 'u-student-2',
    name: 'Dharun',
    email: 'dharun.student@gmail.com',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'Student',
    department: 'Information Technology',
    createdBy: 'shruthi.teacher@gmail.com'
  },
  {
    id: 'u-student-3',
    name: 'Kamalesh',
    email: 'kamalesh.student@gmail.com',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'Student',
    department: 'Information Technology',
    createdBy: 'shruthi.teacher@gmail.com'
  },
  {
    id: 'u-student-4',
    name: 'Jazy',
    email: 'jazy.student@gmail.com',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'Student',
    department: 'Information Technology',
    createdBy: 'shruthi.teacher@gmail.com'
  }
];

// Memory store fallback if MongoDB is not connected
global.inMemoryUsers = global.inMemoryUsers || [...defaultUsers];

// Helper to sign JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password, requestedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please enter both email and password' });
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Security Error: User ID must be a valid email address'
    });
  }

  try {
    let userFound = null;

    // Try MongoDB first if connected
    if (User.db && User.db.readyState === 1) {
      userFound = await User.findOne({ email: email.toLowerCase() });
      if (userFound) {
        const isMatch = await userFound.matchPassword(password);
        if (!isMatch) {
          return res.status(401).json({ success: false, error: 'Invalid password credentials' });
        }
      }
    }

    // Fallback to Memory Store if not in DB
    if (!userFound) {
      const memUser = global.inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (memUser) {
        const isMatch = bcrypt.compareSync(password, memUser.passwordHash);
        if (!isMatch) {
          return res.status(401).json({ success: false, error: 'Invalid password credentials' });
        }
        userFound = memUser;
      }
    }

    if (!userFound) {
      return res.status(404).json({ success: false, error: 'No user account found with this Gmail address' });
    }

    // Role check validation if requestedRole passed
    if (requestedRole && userFound.role !== requestedRole) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: This account is registered as '${userFound.role}', not '${requestedRole}'. Please select the correct login tab.`
      });
    }

    const token = generateToken(userFound);

    res.json({
      success: true,
      token,
      user: {
        id: userFound.id || userFound._id,
        name: userFound.name,
        email: userFound.email,
        role: userFound.role,
        department: userFound.department
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error during login authentication' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
