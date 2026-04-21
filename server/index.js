import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'partnersync-secret-key-2024';
const PORT = process.env.PORT || 8080;

// ======== USER MODEL ========
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['provider', 'seeker'], required: true },
  profile: { firstName: String, lastName: String, companyName: String, avatar: String, bio: String, location: String, website: String, linkedin: String },
  providerDetails: { skills: [String], services: [{ name: String, price: Number, description: String }], monthlyRevenue: Number, clientsDelivered: Number, experience: Number, certifications: [String], availability: String },
  seekerDetails: { industry: String, businessType: String, monthlyRevenue: Number, painPoints: [String], budget: Number, lookingFor: String, teamSize: Number },
  stats: { views: Number, connections: Number, messages: Number },
  isVerified: Boolean, lastActive: Date
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

// ======== CONNECTION MODEL ========
const connectionSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  message: String
}, { timestamps: true });
const Connection = mongoose.model('Connection', connectionSchema);

// ======== CONVERSATION/MESSAGE MODELS ========
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: String,
  lastMessageAt: Date
}, { timestamps: true });
const Conversation = mongoose.model('Conversation', conversationSchema);

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String
}, { timestamps: true });
const Message = mongoose.model('Message', messageSchema);

// ======== DEAL MODEL ========
const dealSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['draft', 'negotiating', 'agreed', 'active', 'completed', 'cancelled'], default: 'draft' },
  terms: { type: String, revenueShare: Number, monthlyRetainer: Number, projectFee: Number, description: String }
}, { timestamps: true });
const Deal = mongoose.model('Deal', dealSchema);

// ======== EXPRESS ========
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======== AUTH MIDDLEWARE ========
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

// ======== AUTH ROUTES ========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, profile, providerDetails, seekerDetails } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const user = new User({ email, password, role, profile: profile || {}, providerDetails, seekerDetails });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: user.toJSON() });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: user.toJSON() });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user.toJSON());
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Not found' });
    const { profile, providerDetails, seekerDetails } = req.body;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (providerDetails) user.providerDetails = { ...user.providerDetails, ...providerDetails };
    if (seekerDetails) user.seekerDetails = { ...user.seekerDetails, ...seekerDetails };
    await user.save();
    res.json(user.toJSON());
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ======== USER ROUTES ========
app.get('/api/users', auth, async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search, skills, industry, minRevenue, maxRevenue } = req.query;
    const query = {};
    
    if (role) query.role = role;
    
    if (search) {
      query.$or = [
        { 'profile.companyName': { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { 'providerDetails.skills': { $regex: search, $options: 'i' } },
        { 'seekerDetails.painPoints': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (skills) {
      query['providerDetails.skills'] = { $regex: skills, $options: 'i' };
    }
    
    if (industry) {
      query['seekerDetails.industry'] = { $regex: industry, $options: 'i' };
    }
    
    if (minRevenue || maxRevenue) {
      query['$or'] = query['$or'] || [];
      const revenueQuery = {};
      if (minRevenue) revenueQuery.$gte = Number(minRevenue);
      if (maxRevenue) revenueQuery.$lte = Number(maxRevenue);
      query.$or.push({ 'providerDetails.monthlyRevenue': revenueQuery });
      query.$or.push({ 'seekerDetails.monthlyRevenue': revenueQuery });
    }

    const users = await User.find(query).select('-password').skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/users/matches', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const target = currentUser.role === 'provider' ? 'seeker' : 'provider';
    const users = await User.find({ role: target }).select('-password').limit(50);
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json(user || { message: 'Not found' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ======== CONNECTION ROUTES ========
app.post('/api/connections', auth, async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    if (recipientId === req.userId) return res.status(400).json({ message: 'Cannot connect with yourself' });
    const existing = await Connection.findOne({ requesterId: req.userId, recipientId });
    if (existing) return res.status(400).json({ message: 'Connection already exists' });
    const conn = new Connection({ requesterId: req.userId, recipientId, message });
    await conn.save();
    res.status(201).json(conn);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/connections', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { $or: [{ requesterId: req.userId }, { recipientId: req.userId }] };
    if (status) query.status = status;
    const conns = await Connection.find(query).populate('requesterId', 'profile role').populate('recipientId', 'profile role').sort({ createdAt: -1 });
    res.json(conns.map(c => ({ _id: c._id, user: c.requesterId._id.toString() === req.userId ? c.recipientId : c.requesterId, status: c.status, message: c.message, isRequester: c.requesterId._id.toString() === req.userId, createdAt: c.createdAt })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/connections/:id', auth, async (req, res) => {
  try {
    const conn = await Connection.findById(req.params.id).populate('requesterId', 'profile role').populate('recipientId', 'profile role');
    if (!conn) return res.status(404).json({ message: 'Not found' });
    if (conn.recipientId._id.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });
    conn.status = req.body.status;
    await conn.save();
    const result = {
      _id: conn._id,
      user: conn.requesterId._id.toString() === req.userId ? conn.recipientId : conn.requesterId,
      status: conn.status,
      message: conn.message,
      isRequester: conn.requesterId._id.toString() === req.userId,
      createdAt: conn.createdAt
    };
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/connections/:id', auth, async (req, res) => {
  try { await Connection.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// ======== MESSAGE ROUTES ========
app.get('/api/messages/conversations', auth, async (req, res) => {
  try {
    const convs = await Conversation.find({ participants: req.userId }).populate('participants', 'profile role');
    res.json(convs.map(c => {
      const other = c.participants.find(p => p._id.toString() !== req.userId);
      return { ...c.toObject(), otherUser: other };
    }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/messages/conversations', auth, async (req, res) => {
  try {
    const { participantId } = req.body;
    let conv = await Conversation.findOne({ participants: { $all: [req.userId, participantId] } });
    if (!conv) { conv = new Conversation({ participants: [req.userId, participantId] }); await conv.save(); }
    const populated = await Conversation.findById(conv._id).populate('participants', 'profile role');
    const otherUser = populated.participants.find(p => p._id.toString() !== req.userId);
    res.json({ ...populated.toObject(), otherUser });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/messages/conversations/:id/messages', auth, async (req, res) => {
  try {
    const msgs = await Message.find({ conversationId: req.params.id }).populate('senderId', 'profile').sort({ createdAt: -1 }).limit(50);
    res.json(msgs.reverse());
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/messages/conversations/:id/messages', auth, async (req, res) => {
  try {
    const msg = new Message({ conversationId: req.params.id, senderId: req.userId, content: req.body.content });
    await msg.save();
    await Conversation.findByIdAndUpdate(req.params.id, { lastMessage: req.body.content, lastMessageAt: new Date() });
    const populated = await Message.findById(msg._id).populate('senderId', 'profile');
    res.status(201).json(populated);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ======== DEAL ROUTES ========
app.post('/api/deals', auth, async (req, res) => {
  try {
    const deal = new Deal(req.body);
    await deal.save();
    res.status(201).json(deal);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/deals', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { $or: [{ providerId: req.userId }, { seekerId: req.userId }] };
    if (status) query.status = status;
    const deals = await Deal.find(query).populate('providerId', 'profile providerDetails').populate('seekerId', 'profile seekerDetails').sort({ createdAt: -1 });
    res.json(deals.map(d => ({ ...d.toObject(), otherParty: d.providerId._id.toString() === req.userId ? d.seekerId : d.providerId, isProvider: d.providerId._id.toString() === req.userId })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/deals/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Not found' });
    if (req.body.status) deal.status = req.body.status;
    if (req.body.terms) deal.terms = { ...deal.terms, ...req.body.terms };
    await deal.save();
    res.json(deal);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/deals/:id', auth, async (req, res) => {
  try { await Deal.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// ======== ANALYTICS ROUTES ========
app.get('/api/analytics/dashboard', auth, async (req, res) => {
  try {
    const totalDeals = await Deal.countDocuments({ $or: [{ providerId: req.userId }, { seekerId: req.userId }] });
    const activeDeals = await Deal.countDocuments({ $or: [{ providerId: req.userId }, { seekerId: req.userId }], status: 'active' });
    res.json({ totalDeals, activeDeals, activePartnerships: activeDeals });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/analytics/skills-demand', auth, async (req, res) => {
  try {
    const seekers = await User.find({ role: 'seeker' }).select('seekerDetails.painPoints');
    const counts = {};
    seekers.forEach(s => s.seekerDetails?.painPoints?.forEach(p => counts[p] = (counts[p] || 0) + 1));
    res.json(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([skill, count]) => ({ skill, count })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/analytics/industry-trends', auth, async (req, res) => {
  try {
    const industries = await User.aggregate([{ $match: { role: 'seeker' } }, { $group: { _id: '$seekerDetails.industry', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]);
    res.json(industries.map(i => ({ industry: i._id || 'Unknown', count: i.count })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/analytics/market-insights', auth, async (req, res) => {
  try {
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalSeekers = await User.countDocuments({ role: 'seeker' });
    const activeDeals = await Deal.countDocuments({ status: 'active' });
    res.json({ totalProviders, totalSeekers, activeDeals, avgProviderRevenue: 0, matchRate: 0, totalDeals: 0 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ======== HEALTH & DEFAULT ========
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// ======== CONNECT TO MONGODB ========
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 30000,
  maxPoolSize: 5,
}).then(() => {
  console.log('MongoDB Connected');
  app.listen(PORT, '127.0.0.1', () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB Error:', err.message);
  process.exit(1);
});