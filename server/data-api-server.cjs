require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'partnersync-secret-key-2024';
const PORT = process.env.PORT || 8080;

const ATLAS_API_URL = process.env.ATLAS_DATA_API_URL;
const ATLAS_API_KEY = process.env.ATLAS_DATA_API_KEY;

const app = express();
app.use(cors());
app.use(express.json());

const fetchDb = async (action, collection, body = {}) => {
  const res = await fetch(`${ATLAS_API_URL}/action/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': ATLAS_API_KEY },
    body: JSON.stringify({ dataSource: 'partnersync', collection, database: 'partnersync', ...body })
  });
  return res.json();
};

const db = (collection) => fetchDb('find', collection, { filter: {} });
const dbInsert = (collection, doc) => fetchDb('insertOne', collection, { document: doc });
const dbUpdate = (collection, filter, update) => fetchDb('updateOne', collection, { filter, update: { $set: update } });
const dbDelete = (collection, filter) => fetchDb('deleteOne', collection, { filter });
const dbAggregate = (collection, pipeline) => fetchDb('aggregate', collection, { pipeline });

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, profile } = req.body;
    const users = await db('users');
    if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email exists' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await dbInsert('users', { email, password: hashedPassword, role, profile, stats: { views: 0, connections: 0, messages: 0 }, createdAt: new Date() });
    const token = jwt.sign({ id: result.insertedId, email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email, role, profile } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await db('users');
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, role: user.role, profile: user.profile, stats: user.stats } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/users', authenticate, async (req, res) => {
  const users = await db('users');
  res.json(users.map(u => ({ ...u, password: undefined })));
});

app.get('/api/users/matches', authenticate, async (req, res) => {
  const users = await db('users');
  const matches = users.filter(u => u._id !== req.user.id && u.role !== req.user.role);
  res.json(matches);
});

app.get('/api/users/:id', authenticate, async (req, res) => {
  const users = await db('users');
  const user = users.find(u => u._id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ ...user, password: undefined });
});

app.put('/api/users/profile', authenticate, async (req, res) => {
  await dbUpdate('users', { _id: req.user.id }, req.body);
  res.json({ success: true });
});

app.get('/api/analytics/dashboard', authenticate, async (req, res) => {
  const users = await db('users');
  const connections = await db('connections');
  res.json({ totalUsers: users.length, totalDeals: 0, activePartnerships: connections.filter(c => c.status === 'accepted').length });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

console.log(`Server starting on port ${PORT}...`);

if (!ATLAS_API_URL || !ATLAS_API_KEY) {
  console.error('ERROR: ATLAS_DATA_API_URL and ATLAS_DATA_API_KEY must be set in .env');
  process.exit(1);
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));