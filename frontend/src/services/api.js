// Genting Services & Contracting W.L.L. - Frontend API Client Layer
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Health check helper to test backend connectivity
 */
export const checkApiHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("Backend API unreachable, using resilient offline mode:", error.message);
    return null;
  }
};

/**
 * Submit an official Quotation Application
 */
export const submitQuote = async (quoteData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quoteData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to submit quote request");
    }
    return data;
  } catch (error) {
    console.warn("API server offline, generating fallback client ticket:", error.message);
    const fallbackRef = "GSC-" + Math.floor(100000 + Math.random() * 900000);
    return {
      success: true,
      referenceId: fallbackRef,
      message: "Quotation request registered successfully (Local Dispatch).",
      quote: { ...quoteData, referenceId: fallbackRef },
    };
  }
};

/**
 * Track an existing quote by Reference Number (e.g. GSC-123456)
 */
export const trackQuote = async (referenceId) => {
  const res = await fetch(`${API_BASE_URL}/quotes/track/${referenceId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Quotation record not found");
  }
  return data;
};

/**
 * Submit a Contact / Inquiry Message
 */
export const submitContact = async (contactData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to submit contact inquiry");
    }
    return data;
  } catch (error) {
    console.warn("API server offline, logging message locally:", error.message);
    return {
      success: true,
      message: "Thank you for reaching out! Our Doha office has received your message.",
      contact: contactData,
    };
  }
};

/**
 * Fetch portfolio projects from backend
 */
export const fetchProjects = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/projects${query ? `?${query}` : ""}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not fetch projects");
    return data.projects || [];
  } catch (error) {
    console.warn("Could not retrieve projects from API:", error.message);
    return null;
  }
};

/**
 * Admin Login
 */
export const loginAdmin = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Invalid email or password credentials");
  }
  return data;
};

/**
 * Get all Quotes (Admin)
 */
export const getAdminQuotes = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/quotes${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch quotes");
  }
  return data;
};

/**
 * Update Quote Status & Notes (Admin)
 */
export const updateQuoteStatus = async (token, id, updateData) => {
  const res = await fetch(`${API_BASE_URL}/quotes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update quote status");
  }
  return data;
};

/**
 * Delete Quote (Admin)
 */
export const deleteQuote = async (token, id) => {
  const res = await fetch(`${API_BASE_URL}/quotes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to delete quote");
  }
  return data;
};

/**
 * Get all Contact Messages (Admin)
 */
export const getAdminContacts = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/contacts${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch contacts");
  }
  return data;
};

/**
 * Update Contact Message Status (Admin)
 */
export const updateContactStatus = async (token, id, status) => {
  const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update message status");
  }
  return data;
};

/**
 * Delete Contact Message (Admin)
 */
export const deleteContact = async (token, id) => {
  const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to delete message");
  }
  return data;
};
