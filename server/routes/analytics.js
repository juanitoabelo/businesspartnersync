import express from 'express';
import User from '../models/User.js';
import Deal from '../models/Deal.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    let data = {};

    if (req.user.role === 'provider') {
      const recentDeals = await Deal.find({
        providerId: userId
      }).sort({ createdAt: -1 }).limit(5);

      const activeDeals = await Deal.countDocuments({
        providerId: userId,
        status: 'active'
      });

      const agreedDeals = await Deal.countDocuments({
        providerId: userId,
        status: 'agreed'
      });

      data = {
        totalDeals: await Deal.countDocuments({ providerId: userId }),
        activeDeals,
        agreedDeals,
        recentDeals
      };
    } else {
      const totalSpent = await Deal.aggregate([
        { $match: { seekerId: userId, status: { $in: ['active', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$terms.monthlyRetainer' } } }
      ]);

      data = {
        activePartnerships: await Deal.countDocuments({
          seekerId: userId,
          status: 'active'
        }),
        totalInvested: totalSpent[0]?.total || 0
      };
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/skills-demand', auth, async (req, res) => {
  try {
    const seekers = await User.find({ role: 'seeker' })
      .select('seekerDetails.painPoints');

    const skillCounts = {};
    seekers.forEach(s => {
      s.seekerDetails?.painPoints?.forEach(p => {
        skillCounts[p] = (skillCounts[p] || 0) + 1;
      });
    });

    const sorted = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/industry-trends', auth, async (req, res) => {
  try {
    const industries = await User.aggregate([
      { $match: { role: 'seeker' } },
      { $group: { _id: '$seekerDetails.industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    res.json(industries.map(i => ({ 
      industry: i._id || 'Unknown', 
      count: i.count 
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/market-insights', auth, async (req, res) => {
  try {
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalSeekers = await User.countDocuments({ role: 'seeker' });
    const activeDeals = await Deal.countDocuments({ status: 'active' });
    const totalDeals = await Deal.countDocuments();

    const avgRevenue = await User.aggregate([
      { $match: { role: 'provider' } },
      { $group: { _id: null, avg: { $avg: '$providerDetails.monthlyRevenue' } } }
    ]);

    res.json({
      totalProviders,
      totalSeekers,
      activeDeals,
      totalDeals,
      avgProviderRevenue: avgRevenue[0]?.avg || 0,
      matchRate: totalDeals > 0 ? (activeDeals / totalDeals * 100).toFixed(1) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;