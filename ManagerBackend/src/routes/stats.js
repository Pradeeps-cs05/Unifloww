import express from "express";
import Client from "../models/Client.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// 📊 GET STATS
router.get("/", auth, async (req, res) => {
  try {
    // 🔢 TOTAL COUNTS
    const totalClients = await Client.countDocuments({ deleted: { $ne: true } });
    const totalUsers = await User.countDocuments();

    // 📈 MONTHLY CLIENTS
    const monthlyClients = await Client.aggregate([
      {
        $match: { deleted: { $ne: true } }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // 🔄 FORMAT DATA
    const formattedMonthly = monthlyClients.map(item => ({
      month: `${item._id.month}/${item._id.year}`,
      count: item.count
    }));

    res.json({
      totalClients,
      totalUsers,
      monthlyClients: formattedMonthly
    });

  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;