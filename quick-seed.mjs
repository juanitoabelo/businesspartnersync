// Simple seed script
import 'dotenv/config';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  
  const UserSchema = new mongoose.Schema({
    email: String, password: String, role: String,
    profile: Object, providerDetails: Object, seekerDetails: Object, stats: Object,
    isVerified: Boolean, lastActive: Date
  });
  
  const User = mongoose.model('User', UserSchema);
  
  // Insert test user
  const user = new User({
    email: 'demo@partnersync.com',
    password: 'password123',
    role: 'provider',
    profile: { firstName: 'Demo', companyName: 'Demo Company' },
    providerDetails: { skills: ['Web Design', 'SEO'], monthlyRevenue: 5000, experience: 3, availability: 'open' },
    seekerDetails: {},
    stats: { views: 0, connections: 0, messages: 0 },
    isVerified: true,
    lastActive: new Date()
  });
  
  user.password = await import('bcryptjs').then(m => m.hashSync('password123', 12));
  await user.save();
  
  console.log('User created:', user.email);
  console.log('Password: password123');
  
  await mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});