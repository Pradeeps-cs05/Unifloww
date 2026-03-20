import express from "express";
import Client from "../models/Client.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// 📊 GET STATS
router.get("/", auth, async (req, res) => {
  try {
    const totalClients = await Client.countDocuments({ deleted: { $ne: true } });
    const totalUsers = await User.countDocuments();

    // 📈 Monthly Clients
    const monthlyClients = await Client.aggregate([
      { $match: { deleted: { $ne: true } } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const formattedMonthly = monthlyClients.map(item => ({
      month: `${item._id.month}/${item._id.year}`,
      count: item.count
    }));

    // 📅 Daily Activity (last 7 days)
    const last7Days = await Client.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          deleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.day": 1 } }
    ]);

    const formattedDaily = last7Days.map(item => ({
      day: `${item._id.day}/${item._id.month}`,
      count: item.count
    }));

    res.json({
      totalClients,
      totalUsers,
      monthlyClients: formattedMonthly,
      dailyActivity: formattedDaily
    });

  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;