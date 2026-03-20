import "./Dashboard.css"; // reuse same style

export default function Statistics() {
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
            Chart will come here
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