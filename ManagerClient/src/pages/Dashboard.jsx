import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiUserPlus, FiUserCheck, FiUsers, FiBarChart2, FiLogOut } from "react-icons/fi";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return <div className="loading">Loading...</div>;

  function handleLogout() {
    logoutUser();
    navigate("/", { replace: true });
  }

  // Dashboard cards with icons
  const cards = [
    { title: "Add client Info", icon: <FiUserPlus />, onClick: () => navigate("/add-user") },
    { title: "Update client Info", icon: <FiUserCheck />, onClick: () => navigate("/update-user") },
    { title: "Retrieve All clients", icon: <FiUsers />, onClick: () => navigate("/view-clients") },
    { title: "Statistics", icon: <FiBarChart2 />, onClick: () => navigate("/statistics") },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <header className="dashboard-header">
          <h1 className="dashboard-title">UniFloww !!</h1>
          <button className="dashboard-logout" onClick={handleLogout}>
            <FiLogOut size={18} /> Sign out
          </button>
        </header>

        <section className="dashboard-welcome">
          <h2>Welcome, {user.displayName || user.username || "User"}!</h2>
          <p className="dashboard-sub">Manage users and view statistics</p>
        </section>

        <section className="dashboard-grid">
          {cards.map(({ title, icon, onClick }, index) => (
            <div
              key={index}
              className="dash-card"
              onClick={onClick}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === "Enter" && onClick()}
            >
              <div className="dash-icon">{icon}</div>
              <h3>{title}</h3>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
