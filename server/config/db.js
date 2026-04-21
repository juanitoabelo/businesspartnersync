import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/partnersync';
  console.log('Connecting to MongoDB:', mongoURI);
  
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log('MongoDB Connected successfully');
    console.log('Host:', conn.connection.host);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    throw error;
  }
};

export default connectDB;