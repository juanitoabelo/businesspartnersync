import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/test-register', async (req, res) => {
  const { email } = req.body;
  res.json({ message: 'Received: ' + email });
});

const PORT = process.env.PORT || 5000;

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
} catch(e) {
  console.error('Error:', e.message);
  process.exit(1);
}