import 'dotenv/config';
import mongoose from 'mongoose';

console.log('=== MongoDB Connection Test ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ SUCCESS! Connected to MongoDB Atlas');
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ FAILED:', err.message);
    process.exit(1);
  });