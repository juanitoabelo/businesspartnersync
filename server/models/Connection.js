import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

connectionSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

export default mongoose.model('Connection', connectionSchema);