import API_BASE_URL from "../apiConfig";

/**
 * Unified fetch response handler with detailed error context.
 * Ensures the response body is read only once.
 */
export async function handleResponse(res, context = "API request") {
  let data;
  let text;

  try {
    // Try reading response as text once
    text = await res.text();

    // Attempt to parse as JSON (if applicable)
    data = text ? JSON.parse(text) : {};
  } catch {
    // Parsing failed → treat as plain text
    data = { raw: text || "" };
  }

  // Build error message if response is not ok
  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      data?.raw ||
      res.statusText ||
      "Unknown error";

    throw new Error(`❌ ${context} failed: ${msg} (status: ${res.status})`);
  }

  // Return parsed JSON if possible, else fallback to text
  return Object.keys(data).length > 0 ? data : { raw: text || "" };
}


// ----------------- AUTH -----------------
export async function signup(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(res, "Signup");
}

export async function login(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await handleResponse(res, "Login"); // parse + validate in one step

  // Store JWT and user
  if (data.token) localStorage.setItem("jwt_token", data.token);
  if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

  return data; // { user, token, message }
}

// --- NEW: Function to request a password reset link ---
export async function forgotPassword(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(res, "Request password reset");
}

// --- Function to submit the new password with the reset token ---
export async function resetPassword(token, payload) {
  // Construct the full URL, including the reset token in the path
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
    method: "POST", // Use POST to send the new password data
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // Convert the password object to a JSON string
    credentials: "include", // Maintain consistency with your other API calls
  });

  // Use your existing handler for response parsing and error management
  return handleResponse(res, "Reset password");
}

// ----------------- CLIENT -----------------
export async function addClient(form, documents = [], username = "") {
  const data = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value != null) data.append(key, value);
  });
  if (username) data.append("createdBy", username);
  documents.forEach((file) => data.append("documents", file));

  const token = localStorage.getItem("jwt_token"); // get stored JWT
  if (!token) throw new Error("No token found. Please login.");

  const clientName = form?.name || "Unknown client";
  const res = await fetch(`${API_BASE_URL}/api/client/add`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // attach token
    },
    body: data,
    credentials: "include",
  });

  return handleResponse(res, `Add client: ${clientName}`);
}

export async function searchClient(query) {
  const token = localStorage.getItem("jwt_token");

  try {
    const res = await fetch(`${API_BASE_URL}/api/client/search?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

  
    // ✅ Handle non-OK responses
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized: please log in again");
      }
      if (res.status === 403) {
        throw new Error("Forbidden: insufficient permissions");
      }
      if (res.status === 404) {
        // No clients found → return empty array
        return [];
      }
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error("Search client error:", err);
    return [];
  }
}


export async function updateClient(id, data, documents = [], removeDocs = [], username = "") {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value != null) formData.append(key, value);
  });
  documents.forEach((file) => formData.append("documents", file));
  if (removeDocs.length > 0) formData.append("removeDocs", JSON.stringify(removeDocs));
  if (username) formData.append("updatedBy", username);

  const token = localStorage.getItem("jwt_token"); // get stored JWT
  if (!token) throw new Error("No token found. Please login.");

  const clientName = data?.name || "Unknown client";
  const res = await fetch(`${API_BASE_URL}/api/client/update/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`, // attach token
    },
    body: formData,
    credentials: "include",
  });

  return handleResponse(res, `Update client: ${clientName}`);
}

/**
 * Fetch paginated and searchable clients
 */
export async function getAllClients({ page = 1, limit = 10, search = "", sortBy = "createdAt", sortOrder = "desc" } = {}) {
  const token = localStorage.getItem("jwt_token");
  if (!token) throw new Error("No token found. Please login.");

  const params = new URLSearchParams({ page, limit, search, sortBy, sortOrder });

  const res = await fetch(`${API_BASE_URL}/api/client/all?${params.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });

  return handleResponse(res, "Get all clients");
}

/**
 * Delete a client by ID
 * @param {string} clientId - The ID of the client to delete
 */
export async function deleteClient(clientId) {
  if (!clientId) throw new Error("Client ID is required");

  const token = localStorage.getItem("jwt_token");
  if (!token) throw new Error("No token found. Please login.");

  const res = await fetch(`${API_BASE_URL}/api/client/delete/${clientId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  return handleResponse(res, `Delete client: ${clientId}`);
}
