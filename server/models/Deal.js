import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'negotiating', 'agreed', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  terms: {
    type: {
      type: String,
      enum: ['partnership', 'freelancer', 'project'],
      default: 'partnership'
    },
    revenueShare: { type: Number, default: 0 },
    monthlyRetainer: { type: Number, default: 0 },
    projectFee: { type: Number, default: 0 },
    description: { type: String, default: '' }
  },
  messages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Deal', dealSchema);