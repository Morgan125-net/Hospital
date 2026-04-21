const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const Doctor = require('../models/doctor.model');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

const router = express.Router();

// Path to users.json
const usersFilePath = path.join(__dirname, '../data/users.json');

// Helper: Read users
const getUsers = () => {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }

  const data = fs.readFileSync(usersFilePath);
  return JSON.parse(data);
};

// Helper: Save users
const saveUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};



// ========================
// REGISTER
// ========================
router.post('/register', auth, role(['admin']), async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const users = getUsers();

    // Prevent duplicate email
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Prevent duplicate username
    const existingUsername = users.find(u => u.username === username);
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: uuidv4(),
      name,
      email,
      username,
      password: hashedPassword,
      role
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});



// ========================
// LOGIN
// ========================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }

    const users = getUsers();

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: String(user.role).toLowerCase().trim(),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

//
router.post('/doctor-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const doctor = await Doctor.findOne({ username });

    if (!doctor) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: doctor._id,
        username: doctor.username,
        role: doctor.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during doctor login' });
  }
});

//
router.get("/users", auth, role(['admin']), (req, res) => {
  try {
    const users = getUsers();

    const safeUsers = users
      .filter((u) => u.role)
      .map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
      }));

    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.delete("/users/:id", auth, role(['admin']), (req, res) => {
  try {
    const users = getUsers();
    const userToDelete = users.find((u) => u.id === req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToDelete.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const remainingUsers = users.filter((u) => u.id !== req.params.id);
    saveUsers(remainingUsers);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

router.patch("/users/:id/password", auth, role(['admin']), async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 4) {
      return res.status(400).json({
        message: "Password must be at least 4 characters",
      });
    }

    const users = getUsers();
    const userToUpdate = users.find((u) => u.id === req.params.id);

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    userToUpdate.password = await bcrypt.hash(password, 10);
    saveUsers(users);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update password" });
  }
});



module.exports = router;
