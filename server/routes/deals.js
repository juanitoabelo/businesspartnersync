import express from 'express';
import Deal from '../models/Deal.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { providerId, seekerId, terms } = req.body;
    
    const deal = new Deal({
      providerId,
      seekerId,
      terms: terms || {}
    });

    await deal.save();
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      $or: [
        { providerId: req.user._id },
        { seekerId: req.user._id }
      ]
    };
    
    if (status) query.status = status;

    const deals = await Deal.find(query)
      .populate('providerId', 'profile providerDetails')
      .populate('seekerId', 'profile seekerDetails')
      .sort({ createdAt: -1 });

    const formatted = deals.map(deal => ({
      ...deal.toObject(),
      otherParty: deal.providerId._id.toString() === req.user._id.toString() 
        ? deal.seekerId 
        : deal.providerId,
      isProvider: deal.providerId._id.toString() === req.user._id.toString()
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('providerId', 'profile providerDetails')
      .populate('seekerId', 'profile seekerDetails');
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const isAuthorized = 
      deal.providerId._id.toString() === req.user._id.toString() ||
      deal.seekerId._id.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { status, terms, message } = req.body;
    
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const isAuthorized = 
      deal.providerId.toString() === req.user._id.toString() ||
      deal.seekerId.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (status) deal.status = status;
    if (terms) deal.terms = { ...deal.terms, ...terms };
    if (message) {
      deal.messages.push({
        senderId: req.user._id,
        content: message,
        createdAt: new Date()
      });
    }

    await deal.save();
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const isAuthorized = 
      deal.providerId.toString() === req.user._id.toString() ||
      deal.seekerId.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await deal.deleteOne();
    res.json({ message: 'Deal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;