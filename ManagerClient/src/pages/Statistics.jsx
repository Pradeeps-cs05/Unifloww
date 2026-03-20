import "./Dashboard.css";
import { useEffect, useState } from "react"; // reuse same style
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

export default function Statistics() {
const [stats, setStats] = useState(null);

useEffect(() => {
  async function fetchStats() {
    try {
      const res = await fetch(
        "https://api.pradeeptech.online/api/stats",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }

  fetchStats();
}, []);

  if (!stats) {
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">

        <h1 className="dashboard-title">📊 Dashboard Statistics</h1>

        {/* TOP CARDS */}
        <div className="dashboard-grid" style={{ marginTop: "20px" }}>
          <div className="dash-card">
            <h3>Total Clients</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>1</p>
          </div>

          <div className="dash-card">
            <h3>Total Users</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>1</p>
          </div>
        </div>

    <div style={{ marginTop: "40px" }}>
  <h2>🥧 Users vs Clients</h2>

  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={[
          { name: "Clients", value: stats?.totalClients || 0 },
          { name: "Users", value: stats?.totalUsers || 0 }
        ]}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        <Cell fill="#8884d8" />
        <Cell fill="#82ca9d" />
      </Pie>
      <Legend />
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>

        {/* CHART SECTION */}
        <div style={{ marginTop: "40px" }}>
          <h2>📈 Monthly Clients</h2>
          <div style={{
            height: "300px",
            background: "#f5f5f5",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <ResponsiveContainer width="100%" height={300}>
  <BarChart data={stats?.monthlyClients || []}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="count" radius={[10, 10, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
          </div>
        </div>

        <div style={{ marginTop: "40px" }}>
  <h2> Daily Activity (Last 7 Days)</h2>

  <div style={{
    height: "300px",
    background: "#fff",
    borderRadius: "12px",
    padding: "20px"
  }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={stats?.dailyActivity || []}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

        {/* ACTIVITY */}
        <div style={{ marginTop: "40px" }}>
          <h2>Recent Activity</h2>
          <p>Pradeep S (pradeepsivasubramanian@gmail.com)</p>
        </div>

      </div>
    </div>
  );
}