import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllClients, searchClient, deleteClient } from "../utils/api";
import { FiTrash2, FiDownload, FiUpload } from "react-icons/fi";
import {
  FiLogOut,
  FiHome,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import ClientDetails from "../components/ClientDetails";
import "./ViewClients.css";

// -----------------------
// Debounce Hook
// -----------------------
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function ViewClients() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  // -----------------------
  // State
  // -----------------------
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [listLoading, setListLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [selectedClient, setSelectedClient] = useState(null);
  const [existingDocs, setExistingDocs] = useState([]);

  // -----------------------
  // Panel visibility & resizing
  // -----------------------
  const [panelWidth, setPanelWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  // Search input ref to maintain focus
  const searchInputRef = useRef(null);
  const isTypingRef = useRef(false);
  
  // Intersection observer ref for infinite scroll
  const observerTarget = useRef(null);

  // -----------------------
  // Resizing panel
  // -----------------------
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 300 && newWidth <= 1200) setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.classList.remove("noselect");
      }
    };

    if (isResizing) document.body.classList.add("noselect");

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("noselect");
    };
  }, [isResizing]);

  // -----------------------
  // Fetch client list
  // -----------------------
  const fetchClients = useCallback(async (pageNum, isLoadMore = false) => {
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setListLoading(true);
    }
    
    setError("");
    
    try {
      const data = await getAllClients({
        page: pageNum,
        limit,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      });

      if (data && data.clients) {
        if (isLoadMore) {
          // Append to existing clients
          setClients((prev) => [...prev, ...data.clients]);
        } else {
          // Replace clients (initial load or filter change)
          setClients(data.clients);
        }
        
        // Check if there are more pages
        setHasMore(pageNum < data.totalPages);
      } else {
        if (!isLoadMore) {
          setClients([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to fetch clients");
    } finally {
      setListLoading(false);
      setLoadingMore(false);
      
      // Refocus search input after list updates if user was typing
      if (isTypingRef.current && searchInputRef.current) {
        requestAnimationFrame(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        });
      }
    }
  }, [user, navigate, limit, debouncedSearch, sortBy, sortOrder]);

  // Initial load and when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchClients(1, false);
  }, [debouncedSearch, sortBy, sortOrder]);

  // -----------------------
  // Infinite Scroll Observer
  // -----------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // When the target element is visible and we have more data
        if (entries[0].isIntersecting && hasMore && !loadingMore && !listLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchClients(nextPage, true);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, listLoading, page, fetchClients]);

  // -----------------------
  // Handlers
  // -----------------------
  const handleLogout = () => {
    logoutUser();
    navigate("/", { replace: true });
  };

  const handleGoDashboard = () => navigate("/dashboard");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setSearch(value);
    isTypingRef.current = true;
    
    // Restore cursor position and focus after render
    requestAnimationFrame(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    });
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleViewDetails = async (clientFromList) => {
    setDetailsLoading(true);
    try {
      const fullClient = await searchClient(clientFromList.email);
      if (fullClient && fullClient.length > 0) {
        setSelectedClient(fullClient[0]);
        setExistingDocs(fullClient[0].documents || []);
      } else {
        setSelectedClient(clientFromList);
        setExistingDocs([]);
      }
    } catch (err) {
      console.error("Error fetching client details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteClientFromList = async (clientId, clientName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete client: ${clientName}?`);
    if (!confirmDelete) return;
  
    try {
      setListLoading(true);
      await deleteClient(clientId);
      alert(`Client deleted: ${clientName}`);
  
      // Remove from client list
      setClients((prev) => prev.filter((c) => c._id !== clientId));
  
      // Close details panel if it was open for this client
      if (selectedClient?._id === clientId) {
        closeDetailsPanel();
      }
    } catch (err) {
      alert("Error deleting client: " + (err?.message || ""));
    } finally {
      setListLoading(false);
    }
  };

  const closeDetailsPanel = () => {
    setSelectedClient(null);
    setExistingDocs([]);
  };

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="view-clients">
      <div className="view-page">
        <div className="view-card">
          {/* Header */}
          <header className="view-header">
            <h1 className="view-title">All Clients</h1>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={handleGoDashboard} className="btn-home">
                <FiHome size={16} /> Dashboard
              </button>
              <button onClick={handleLogout} className="btn-logout">
                <FiLogOut size={16} /> Sign Out
              </button>
            </div>
          </header>

          {/* Search */}
          <div className="search-bar">
            <FiSearch />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={handleSearchChange}
              onBlur={() => {
                // Reset typing flag when user clicks away
                isTypingRef.current = false;
              }}
            />
          </div>

          {/* Sort */}
          <div className="sort-controls">
            <span>Sort by: </span>
            <button onClick={() => toggleSort("name")} className="sort-btn">
              Name {sortBy === "name" && (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
            </button>
            <button onClick={() => toggleSort("email")} className="sort-btn">
              Email {sortBy === "email" && (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
            </button>
            <button onClick={() => toggleSort("createdAt")} className="sort-btn">
              Created {sortBy === "createdAt" && (sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
            </button>
          </div>

          {/* Client List */}
          <div className="client-list-container">
            {listLoading ? (
              <ul className="client-list-skeleton">
                {Array.from({ length: limit }).map((_, i) => (
                  <li key={i} className="client-skeleton-item" />
                ))}
              </ul>
            ) : error ? (
              <p className="error">{error}</p>
            ) : clients.length === 0 ? (
              <p className="no-results">No clients found.</p>
            ) : (
              <>
                <ul className="client-list">
                  {clients.map((client) => (
                    <li key={client._id} className="client-item" onDoubleClick={() => handleViewDetails(client)} >
                      <div className="client-info">
                        <h3>{client.name || "Unnamed Client"}</h3>
                        <p>{client.email || "No email provided"}</p>
                        {client.phone && <p>{client.phone}</p>}
                      </div>

                      {/* Delete Button */}
                      <button
                        className="delete-client-btn"
                        onClick={() => handleDeleteClientFromList(client._id, client.name)}
                        title={`Delete ${client.name}`}
                      >
                        <FiTrash2 />
                      </button>
                    </li>
                  ))}
                </ul>
                
                {/* Infinite Scroll Trigger */}
                <div ref={observerTarget} style={{ height: "20px", margin: "10px 0" }}>
                  {loadingMore && (
                    <p style={{ textAlign: "center", color: "#666" }}>Loading more clients...</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Resizable & Animated Side Panel */}
        <div
          className={`client-details-panel ${selectedClient ? "open" : ""}`}
          style={{ width: panelWidth }}
        >
          {/* Resize Handle */}
          <div
            className="resize-handle"
            onMouseDown={() => setIsResizing(true)}
          />

          {/* Panel Header */}
          <div className="panel-header">Client Details</div>

          {/* Panel Content */}
          <div className="panel-content">
            {detailsLoading ? (
              <p>Loading details...</p>
            ) : (
              <ClientDetails
                client={selectedClient}
                readonly={true}
                showDocuments={true}
                existingDocs={existingDocs}
              />
            )}
          </div>

          {/* Panel Footer */}
          <div className="panel-footer">
            <button className="close-panel-btn" onClick={closeDetailsPanel}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}