import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['provider', 'seeker'],
    required: true
  },
  profile: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    companyName: { type: String, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  providerDetails: {
    skills: [{ type: String }],
    services: [{
      name: String,
      price: Number,
      description: String
    }],
    monthlyRevenue: { type: Number, default: 0 },
    clientsDelivered: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    certifications: [{ type: String }],
    portfolio: [{
      title: String,
      url: String,
      description: String
    }],
    availability: {
      type: String,
      enum: ['open', 'limited', 'unavailable'],
      default: 'open'
    }
  },
  seekerDetails: {
    industry: { type: String, default: '' },
    businessType: { type: String, default: '' },
    monthlyRevenue: { type: Number, default: 0 },
    painPoints: [{ type: String }],
    budget: { type: Number, default: 0 },
    lookingFor: {
      type: String,
      enum: ['partnership', 'freelancer', 'project'],
      default: 'partnership'
    },
    teamSize: { type: Number, default: 1 }
  },
  stats: {
    views: { type: Number, default: 0 },
    connections: { type: Number, default: 0 },
    messages: { type: Number, default: 0 }
  },
  isVerified: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);