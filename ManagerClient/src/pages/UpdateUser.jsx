import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ClientDetails from "../components/ClientDetails";
import FileUploader from "../components/FileUploader";
import {
  FiLogOut,
  FiHome,
  FiSearch,
} from "react-icons/fi";

import { searchClient, updateClient, deleteClient } from "../utils/api";
import "./UpdateUser.css";

// Debounce hook
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Highlight search matches
function highlightMatch(text, query) {
  if (!query) return text;
  text = text || "";
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, idx) =>
    regex.test(part) ? (
      <strong 
        key={idx} 
        className="highlight highlight-light highlight-dark"
      >
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function UpdateUser() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [existingDocs, setExistingDocs] = useState([]);
  const [docsToDelete, setDocsToDelete] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!debouncedSearch.trim() || client) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const matchedClients = await searchClient(debouncedSearch.trim());
        setSuggestions(matchedClients || []);
        setSelectedIndex(-1);
      } catch {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch, client]);

  const handleSignOut = () => {
    logoutUser();
    navigate("/", { replace: true });
  };

  const handleGoDashboard = () => navigate("/dashboard");

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setClient(null);
    setExistingDocs([]);
    setConfirmation("");
  };

  const handleSelectSuggestion = (c) => {
    setClient(c);
    setExistingDocs(c.documents || []);
    setSearch(c.name);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    }
  };

  const handleClientChange = (updatedClient) => {
    setClient(updatedClient);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!client) return;

    setLoading(true);
    setConfirmation("");

    try {
      const data = await updateClient(
        client._id,
        client,
        newFiles.map((n) => n.file),
        docsToDelete
      );

      setConfirmation(`✅ Client updated successfully: ${client.name}`);

      // Clean up preview URLs
      newFiles.forEach((nf) => {
        if (nf.previewURL) {
          try { 
            URL.revokeObjectURL(nf.previewURL); 
          } catch {}
        }
      });

      // Update local state with server response
      const updatedClient = data.client;
      setClient(updatedClient);
      setExistingDocs(updatedClient.documents || []);
      setNewFiles([]);
      setDocsToDelete([]);
    } catch (err) {
      setConfirmation("❌ Error: " + (err?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete client: ${client.name}?`
    );
    if (!confirmDelete) return;
  
    try {
      setLoading(true);
      // Assume you have an API function deleteClient
      await deleteClient(client._id); 
      setConfirmation(`✅ Client deleted: ${client.name}`);
      setClient(null);
      setSearch("");
      setExistingDocs([]);
    } catch (err) {
      setConfirmation("❌ Error deleting client: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    const previewURLs = newFiles.map((nf) => nf.previewURL).filter(Boolean);
    return () => {
      previewURLs.forEach((url) => {
        try { 
          URL.revokeObjectURL(url); 
        } catch {}
      });
    };
  }, [newFiles]);

  return (
    <div className="update-user">
      <div className="update-page">
        <div className="update-card">
          <header className="update-header">
            <h1 className="update-title">Update Client Info</h1>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <button
                className="update-dashboard"
                onClick={handleGoDashboard}
                aria-label="Go to Dashboard"
              >
                <FiHome size={16} /> Dashboard
              </button>
              <button
                className="update-logout"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <FiLogOut size={16} /> Sign out
              </button>
            </div>
          </header>

          {/* Search Section */}
          <div
            className="search-section"
            style={{ marginBottom: "1.5rem", position: "relative" }}
          >
            <label className="field full-row">
              <span>Search Client (Name or Email)</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  value={search}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter client name or email"
                  autoComplete="off"
                  style={{ flex: 1 }}
                  aria-label="Search client by name or email"
                />
                <button
                  type="button"
                  className="update-search"
                  onClick={() => {
                    if (suggestions.length === 1)
                      handleSelectSuggestion(suggestions[0]);
                  }}
                  disabled={loading}
                  style={{ minWidth: 120 }}
                  aria-label="Search"
                >
                  <FiSearch style={{ marginRight: 6 }} /> Search
                </button>
              </div>
            </label>

            {suggestions.length > 0 && (
              <ul className="suggestions-dropdown" role="listbox">
                {suggestions.map((c, idx) => (
                  <li
                    key={c._id}
                    className={selectedIndex === idx ? "selected" : ""}
                    onClick={() => handleSelectSuggestion(c)}
                    role="option"
                    aria-selected={selectedIndex === idx}
                  >
                    {highlightMatch(c.name, search)} (
                    {highlightMatch(c.email, search)})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Client Details Form */}
          <form
            className="update-form"
            onSubmit={handleUpdate}
            style={{
              opacity: client ? 1 : 0.3,
              pointerEvents: client ? "auto" : "none",
              transition: "opacity 0.3s ease",
            }}
          >
            {client ? (
              <>
                <ClientDetails
                  client={client}
                  onChange={handleClientChange}
                  readonly={false}
                  showDocuments={true}
                  existingDocs={existingDocs}
                  docsToDelete={docsToDelete}
                  setDocsToDelete={setDocsToDelete}
                />

                {/* New Documents Upload Section */}
                <div className="form-section">
                  <div className="section-title">Upload New Documents</div>
                  <FileUploader files={newFiles} setFiles={setNewFiles} />
                </div>

                {/* Submit Button */}
                <div className="submit-wrapper" style={{ display: "flex", gap: "1rem" }}>
                  <button 
                    type="submit" 
                    className="update-submit" 
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Client"}
                  </button>
                </div>

                {/* Confirmation Message */}
                {confirmation && (
                  <div
                    className={`confirmation-message${
                      confirmation.startsWith("❌") ? " error" : " success"
                    }`}
                    role="alert"
                  >
                    {confirmation}
                  </div>
                )}
              </>
            ) : (
              <div className="no-client-placeholder">
                <p>Search for a client to update their details.</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}