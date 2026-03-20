import { useEffect, useState } from "react";
import API_BASE_URL from "../apiConfig";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import "./Statistics.css";

export default function Statistics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/client/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <p className="loading">Loading...</p>;

  const chartData = stats.monthlyClients.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    clients: item.count
  }));

  return (
    <div className="stats-container">
      <h1 className="stats-title">📊 Dashboard Statistics</h1>

      <div className="stats-cards">
        <div className="stats-card">
          <h3>Total Clients</h3>
          <p>{stats.totalClients}</p>
        </div>

        <div className="stats-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
      </div>

      <div className="chart-section">
        <h2>📈 Monthly Clients</h2>
        <BarChart width={600} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="clients" />
        </BarChart>
      </div>

      <div className="activity-section">
        <h2>🔥 Recent Activity</h2>
        {stats.recentClients.map((c, i) => (
          <div key={i} className="activity-item">
            {c.name} ({c.email})
          </div>
        ))}
      </div>
    </div>
  );
}