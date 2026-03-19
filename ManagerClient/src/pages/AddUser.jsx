import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLogOut, FiHome } from "react-icons/fi";
import { addClient } from "../utils/api";
import FileUploader from "../components/FileUploader";
import ClientDetails from "../components/ClientDetails";
import "./AddUser.css";

export default function AddUser() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    college: "",
    company: "",
    role: "",
    countryWishlist: "",
    collegeWishlist: "",
    courseWishlist: "",
    budget: "",
    other: "",
    address: "",
  });

  const [documents, setDocuments] = useState([]); // [{ file, previewURL }]
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect to login if no user
  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  function handleSignOut() {
    logoutUser();
    navigate("/", { replace: true });
  }

  function handleGoDashboard() {
    navigate("/dashboard");
  }

  // Clean up object URLs when unmounting
  useEffect(() => {
    return () => {
      documents.forEach((doc) => URL.revokeObjectURL(doc.previewURL));
    };
  }, [documents]);

  async function handleSubmit(e) {
    e.preventDefault();
    setConfirmation("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      alert("Please provide Name, Email, and Phone number.");
      return;
    }

    setLoading(true);
    try {
      const result = await addClient(form, documents.map((d) => d.file));
      setConfirmation(`Client created! ${result.client.name}`);

      // Reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        education: "",
        college: "",
        company: "",
        role: "",
        countryWishlist: "",
        collegeWishlist: "",
        courseWishlist: "",
        budget: "",
        other: "",
        address: "",
      });

      // Revoke previews and clear docs
      documents.forEach((doc) => URL.revokeObjectURL(doc.previewURL));
      setDocuments([]);
    } catch (err) {
      setConfirmation("Error: " + (err.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-user">
      <div className="add-page">
        <div className="add-card">
          <header className="add-header">
            <h1 className="add-title">Add Client Info</h1>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button
                className="add-dashboard"
                onClick={handleGoDashboard}
                aria-label="Go to dashboard"
              >
                <FiHome size={16} /> Dashboard
              </button>
              <button
                className="add-logout"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <FiLogOut size={18} /> Sign out
              </button>
            </div>
          </header>

          <form className="add-form" onSubmit={handleSubmit}>
            {/* Client Info Form (reusable) */}
            <ClientDetails
              client={form}
              onChange={setForm}
              readonly={false}
              showDocuments={false}
            />

            {/* File Upload Section */}
            <div className="form-section">
              <div className="section-title">Documents</div>
              <FileUploader files={documents} setFiles={setDocuments} />
            </div>

            {/* Submit Button */}
            <div className="submit-wrapper">
              <button type="submit" className="add-submit" disabled={loading}>
                {loading ? "Creating..." : "Create Client"}
              </button>
            </div>

            {/* Confirmation Message */}
            {confirmation && (
              <div
                className={
                  "confirmation-message" +
                  (confirmation.trim().startsWith("Error") ? " error" : " success")
                }
              >
                {confirmation}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
