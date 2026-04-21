import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const testDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/partnersync';
  console.log('Testing connection to:', mongoURI);
  
  try {
    await mongoose.connect(mongoURI);
    console.log('✓ MongoDB connected successfully!');
    
    // Test creating a user
    const { default: User } = await import('./server/models/User.js');
    const count = await User.countDocuments();
    console.log('✓ Users collection exists, count:', count);
    
    await mongoose.disconnect();
    console.log('✓ Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

testDB();