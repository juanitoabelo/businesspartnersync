import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { role, skills, industry, minRevenue, maxRevenue, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (role) query.role = role;
    if (skills) query['providerDetails.skills'] = { $in: skills.split(',') };
    if (industry) query['seekerDetails.industry'] = industry;
    if (minRevenue || maxRevenue) {
      query['$or'] = [
        { 'providerDetails.monthlyRevenue': {} },
        { 'seekerDetails.monthlyRevenue': {} }
      ];
      if (minRevenue) query['providerDetails.monthlyRevenue'].$gte = parseInt(minRevenue);
      if (maxRevenue) query['providerDetails.monthlyRevenue'].$lte = parseInt(maxRevenue);
    }
    if (search) {
      query.$or = [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { 'profile.companyName': { $regex: search, $options: 'i' } },
        { 'profile.bio': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/matches', auth, async (req, res) => {
  try {
    const currentUser = req.user;
    let matchQuery = {};

    if (currentUser.role === 'provider') {
      matchQuery = { role: 'seeker' };
      if (currentUser.providerDetails?.skills?.length > 0) {
        matchQuery['seekerDetails.painPoints'] = { 
          $in: currentUser.providerDetails.skills 
        };
      }
    } else {
      matchQuery = { role: 'provider' };
      if (currentUser.seekerDetails?.lookingFor) {
        matchQuery['providerDetails.availability'] = { $ne: 'unavailable' };
      }
    }

    const matches = await User.find(matchQuery)
      .select('-password')
      .limit(50);

    const scoredMatches = matches.map(user => {
      let score = 0;
      if (currentUser.role === 'provider') {
        const userPainPoints = user.seekerDetails?.painPoints || [];
        const mySkills = currentUser.providerDetails?.skills || [];
        const overlap = userPainPoints.filter(p => 
          mySkills.some(s => s.toLowerCase().includes(p.toLowerCase()) || 
            p.toLowerCase().includes(s.toLowerCase()))
        );
        score = overlap.length * 30;
        if (user.seekerDetails?.budget >= currentUser.providerDetails?.services?.[0]?.price) score += 20;
        if (user.seekerDetails?.lookingFor === 'partnership') score += 15;
      } else {
        const myNeeds = currentUser.seekerDetails?.painPoints || [];
        const userSkills = user.providerDetails?.skills || [];
        const overlap = myNeeds.filter(p => 
          userSkills.some(s => s.toLowerCase().includes(p.toLowerCase()) || 
            p.toLowerCase().includes(s.toLowerCase()))
        );
        score = overlap.length * 30;
        if (user.providerDetails?.availability === 'open') score += 20;
      }
      return { user, score };
    });

    scoredMatches.sort((a, b) => b.score - a.score);
    res.json(scoredMatches.filter(m => m.score > 0).map(m => m.user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/featured', auth, async (req, res) => {
  try {
    const oppositeRole = req.user.role === 'provider' ? 'seeker' : 'provider';
    const featured = await User.find({ 
      role: oppositeRole,
      'stats.views': { $gt: 10 },
      isVerified: true
    })
    .select('-password')
    .limit(10)
    .sort({ 'stats.views': -1 });

    res.json(featured);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;