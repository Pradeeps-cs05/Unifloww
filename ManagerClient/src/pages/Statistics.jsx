import { useEffect, useState } from "react";
import API_BASE_URL from "../apiConfig";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

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

  if (!stats) return <p>Loading...</p>;

  const chartData = stats.monthlyClients.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    clients: item.count
  }));

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Statistics</h1>

      <h3>Total Clients: {stats.totalClients}</h3>
      <h3>Total Users: {stats.totalUsers}</h3>

      <h2>📈 Monthly Clients</h2>
      <BarChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="clients" />
      </BarChart>

      <h2>Recent Activity</h2>
      {stats.recentClients.map((c, i) => (
        <div key={i}>
          {c.name} ({c.email})
        </div>
      ))}
    </div>
  );
}