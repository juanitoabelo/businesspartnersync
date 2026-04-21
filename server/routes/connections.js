import express from 'express';
import Connection from '../models/Connection.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const existing = await Connection.findOne({
      requesterId: req.user._id,
      recipientId
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Connection already exists' });
    }

    const connection = new Connection({
      requesterId: req.user._id,
      recipientId,
      message
    });

    await connection.save();
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      $or: [
        { requesterId: req.user._id },
        { recipientId: req.user._id }
      ]
    };
    
    if (status) query.status = status;

    const connections = await Connection.find(query)
      .populate('requesterId', 'profile providerDetails seekerDetails role')
      .populate('recipientId', 'profile providerDetails seekerDetails role')
      .sort({ createdAt: -1 });

    const formatted = connections.map(conn => {
      const isRequester = conn.requesterId._id.toString() === req.user._id.toString();
      return {
        _id: conn._id,
        user: isRequester ? conn.recipientId : conn.requesterId,
        status: conn.status,
        message: conn.message,
        isRequester,
        createdAt: conn.createdAt
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    if (connection.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    connection.status = status;
    if (status === 'accepted' || status === 'declined') {
      connection.respondedAt = new Date();
    }

    await connection.save();

    if (status === 'accepted') {
      await User.findByIdAndUpdate(connection.requesterId, {
        $inc: { 'stats.connections': 1 }
      });
      await User.findByIdAndUpdate(connection.recipientId, {
        $inc: { 'stats.connections': 1 }
      });
    }

    res.json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    const isAuthorized = 
      connection.requesterId.toString() === req.user._id.toString() ||
      connection.recipientId.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await connection.deleteOne();
    res.json({ message: 'Connection deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;