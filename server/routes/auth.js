import express from 'express';
import User from '../models/User.js';
import { auth, generateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, profile } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userData = {
      email,
      password,
      role,
      profile: profile || {}
    };

    const user = new User(userData);
    await user.save();
    
    const token = generateToken(user._id);
    console.log('User registered:', user.email);
    res.status(201).json({ 
      token, 
      user: user.toJSON(),
      message: 'Registration successful' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user._id);
    console.log('User logged in:', user.email);
    res.json({ 
      token, 
      user: user.toJSON() 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json(req.user.toJSON());
});

router.put('/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    if (updates.profile) {
      req.user.profile = { ...req.user.profile.toObject(), ...updates.profile };
    }
    if (updates.providerDetails) {
      req.user.providerDetails = { ...req.user.providerDetails.toObject(), ...updates.providerDetails };
    }
    if (updates.seekerDetails) {
      req.user.seekerDetails = { ...req.user.seekerDetails.toObject(), ...updates.seekerDetails };
    }

    await req.user.save();
    res.json(req.user.toJSON());
  } catch (error) {
    console.error('Update error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post('/logout', auth, async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;