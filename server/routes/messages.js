import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'profile role')
    .sort({ lastMessageAt: -1 });

    const withUsers = await Promise.all(conversations.map(async (conv) => {
      const otherUser = conv.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );
      const lastMessage = await Message.findOne({ conversationId: conv._id })
        .sort({ createdAt: -1 });
      return {
        ...conv.toObject(),
        otherUser
      };
    }));

    res.json(withUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/conversations', auth, async (req, res) => {
  try {
    const { participantId } = req.body;
    
    const existing = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] }
    });

    if (existing) {
      return res.json(existing);
    }

    const conversation = new Conversation({
      participants: [req.user._id, participantId]
    });

    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await Message.find({ conversationId: req.params.id })
      .populate('senderId', 'profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { content, attachments } = req.body;
    
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = new Message({
      conversationId: req.params.id,
      senderId: req.user._id,
      content,
      attachments: attachments || []
    });

    await message.save();

    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id)
      .populate('senderId', 'profile');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;