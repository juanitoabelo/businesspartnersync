import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'partnersync-secret-key-2024';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['provider', 'seeker'], required: true },
  profile: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    companyName: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  providerDetails: { skills: [String], monthlyRevenue: Number, experience: Number },
  seekerDetails: { industry: String, monthlyRevenue: Number, painPoints: [String], budget: Number },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

const User = mongoose.model('User', userSchema);

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, profile } = req.body;
    console.log('Register request:', { email, role });
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, role, profile });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    console.log('User created:', user._id);
    
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ token, user: userObj, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request:', { email });
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get current user
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
app.put('/api/auth/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    console.log('Update request for user:', req.userId, updates);
    
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (updates.profile) user.profile = { ...user.profile, ...updates.profile };
    if (updates.providerDetails) user.providerDetails = { ...user.providerDetails, ...updates.providerDetails };
    if (updates.seekerDetails) user.seekerDetails = { ...user.seekerDetails, ...updates.seekerDetails };

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    console.error('Update error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = 5001;

const start = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_URI;
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoURI);
  console.log('MongoDB Connected');

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch(console.error);