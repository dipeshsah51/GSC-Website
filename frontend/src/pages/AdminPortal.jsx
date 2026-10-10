import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  LogOut,
  ExternalLink,
  FileText,
  MessageSquare,
  Activity,
  AlertTriangle,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  loginAdmin,
  getAdminQuotes,
  updateQuoteStatus,
  deleteQuote,
  getAdminContacts,
  updateContactStatus,
  deleteContact,
  checkApiHealth,
} from "../services/api";

function AdminPortal() {
  // Auth state
  const [token, setToken] = useState(
    () => localStorage.getItem("gsc_admin_token") || ""
  );
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gsc_admin_user") || "null");
    } catch {
      return null;
    }
  });

  // Login form state
  const [email, setEmail] = useState("admin@gsc-qatar.com");
  const [password, setPassword] = useState("admin123456");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Dashboard state
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'quotes' | 'contacts' | 'health'
  const [loadingData, setLoadingData] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [healthInfo, setHealthInfo] = useState(null);

  // Filters & Search
  const [quoteFilter, setQuoteFilter] = useState("All");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [contactFilter, setContactFilter] = useState("All");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  // Status edit modal states
  const [editStatus, setEditStatus] = useState("");
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const data = await loginAdmin(email, password);
      if (data && data.token) {
        setToken(data.token);
        setAdminUser(data.user);
        localStorage.setItem("gsc_admin_token", data.token);
        localStorage.setItem("gsc_admin_user", JSON.stringify(data.user));
      } else {
        setLoginError("Login failed. Check your credentials.");
      }
    } catch (err) {
      setLoginError(err.message || "Invalid email or password.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setToken("");
    setAdminUser(null);
    localStorage.removeItem("gsc_admin_token");
    localStorage.removeItem("gsc_admin_user");
    setSelectedQuote(null);
    setSelectedContact(null);
  };

  // Fetch Dashboard Data
  const loadDashboardData = async () => {
    if (!token) return;
    setLoadingData(true);
    setActionSuccess("");

    try {
      const [quotesRes, contactsRes, healthRes] = await Promise.allSettled([
        getAdminQuotes(token),
        getAdminContacts(token),
        checkApiHealth(),
      ]);

      if (quotesRes.status === "fulfilled" && quotesRes.value?.quotes) {
        setQuotes(quotesRes.value.quotes);
      }
      if (contactsRes.status === "fulfilled" && contactsRes.value?.contacts) {
        setContacts(contactsRes.value.contacts);
      }
      if (healthRes.status === "fulfilled" && healthRes.value) {
        setHealthInfo(healthRes.value);
      }
    } catch (err) {
      console.error("Dashboard refresh error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (token) {
      Promise.allSettled([
        getAdminQuotes(token),
        getAdminContacts(token),
        checkApiHealth(),
      ]).then(([quotesRes, contactsRes, healthRes]) => {
        if (!isMounted) return;
        if (quotesRes.status === "fulfilled" && quotesRes.value?.quotes) {
          setQuotes(quotesRes.value.quotes);
        }
        if (contactsRes.status === "fulfilled" && contactsRes.value?.contacts) {
          setContacts(contactsRes.value.contacts);
        }
        if (healthRes.status === "fulfilled" && healthRes.value) {
          setHealthInfo(healthRes.value);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Handle Quote Update
  const handleUpdateQuote = async () => {
    if (!selectedQuote) return;
    setActionLoading(true);
    setActionSuccess("");

    try {
      const res = await updateQuoteStatus(
        token,
        selectedQuote._id || selectedQuote.referenceId,
        {
          status: editStatus,
          adminNotes: editAdminNotes,
          estimatedBudget: editBudget,
        }
      );

      if (res && res.success) {
        setActionSuccess("Quote details updated successfully!");
        setSelectedQuote(res.quote);
        loadDashboardData();
      }
    } catch (err) {
      alert("Failed to update quote: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Quote Delete
  const handleDeleteQuote = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this quote request?")) return;
    try {
      await deleteQuote(token, id);
      setSelectedQuote(null);
      loadDashboardData();
    } catch (err) {
      alert("Failed to delete quote: " + err.message);
    }
  };

  // Handle Contact Update
  const handleUpdateContact = async (id, status) => {
    try {
      await updateContactStatus(token, id, status);
      loadDashboardData();
      if (selectedContact) {
        setSelectedContact({ ...selectedContact, status });
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Handle Contact Delete
  const handleDeleteContact = async (id) => {
    if (!window.confirm("Delete this contact message?")) return;
    try {
      await deleteContact(token, id);
      setSelectedContact(null);
      loadDashboardData();
    } catch (err) {
      alert("Failed to delete contact: " + err.message);
    }
  };

  // Open Quote Modal
  const openQuoteModal = (quote) => {
    setSelectedQuote(quote);
    setEditStatus(quote.status || "Pending");
    setEditAdminNotes(quote.adminNotes || "");
    setEditBudget(quote.estimatedBudget || "");
    setActionSuccess("");
  };

  // Computed metrics
  const totalQuotes = quotes.length;
  const pendingQuotes = quotes.filter((q) => q.status === "Pending").length;
  const underReviewQuotes = quotes.filter((q) => q.status === "Under Review").length;
  const approvedQuotes = quotes.filter(
    (q) => q.status === "Approved" || q.status === "Quotation Sent"
  ).length;
  const totalContacts = contacts.length;
  const newContacts = contacts.filter((c) => c.status === "New").length;

  // Filtered quotes
  const filteredQuotes = quotes.filter((q) => {
    const matchesFilter = quoteFilter === "All" || q.status === quoteFilter;
    const s = quoteSearch.toLowerCase();
    const matchesSearch =
      !s ||
      q.referenceId?.toLowerCase().includes(s) ||
      q.name?.toLowerCase().includes(s) ||
      q.company?.toLowerCase().includes(s) ||
      q.service?.toLowerCase().includes(s) ||
      q.email?.toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    return contactFilter === "All" || c.status === contactFilter;
  });

  // Status color badge helper
  const getStatusBadge = (status) => {
    const styles = {
      Pending: { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
      "Under Review": { background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" },
      "Quotation Sent": { background: "#e0e7ff", color: "#3730a3", border: "1px solid #c7d2fe" },
      Approved: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
      Declined: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
      New: { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
      "In Progress": { background: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe" },
      Resolved: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
    };

    const currentStyle = styles[status] || { background: "#f3f4f6", color: "#374151" };

    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: "0.75rem",
          fontWeight: "700",
          letterSpacing: "0.02em",
          ...currentStyle,
        }}
      >
        {status}
      </span>
    );
  };

  // IF NOT AUTHENTICATED: RENDER LUXURY LOGIN SCREEN
  if (!token) {
    return (
      <main
        style={{
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
          background:
            "linear-gradient(135deg, rgba(7,23,39,0.97) 0%, rgba(13,38,62,0.95) 100%)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            overflow: "hidden",
            border: "1px solid rgba(215, 169, 40, 0.3)",
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #071727 0%, #0d263e 100%)",
              padding: "36px 30px 28px",
              textAlign: "center",
              borderBottom: "3px solid #d7a928",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(215, 169, 40, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                border: "1px solid rgba(215, 169, 40, 0.4)",
                color: "#d7a928",
              }}
            >
              <Lock size={28} />
            </div>
            <span
              style={{
                color: "#d7a928",
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              GSC ADMINISTRATIVE PORTAL
            </span>
            <h1
              style={{
                fontSize: "1.45rem",
                color: "#ffffff",
                margin: "8px 0 6px",
                fontWeight: "700",
              }}
            >
              Executive Management Login
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
              Genting Services & Contracting W.L.L. (Doha, Qatar)
            </p>
          </div>

          {/* Form Area */}
          <div style={{ padding: "30px" }}>
            {loginError && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "18px" }}>
                <label
                  htmlFor="admin-email"
                  style={{
                    display: "block",
                    fontSize: "0.84rem",
                    fontWeight: "600",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Admin Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={18}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.95rem",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "22px" }}>
                <label
                  htmlFor="admin-password"
                  style={{
                    display: "block",
                    fontSize: "0.84rem",
                    fontWeight: "600",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Admin Security Password
                </label>
                <div style={{ position: "relative" }}>
                  <Key
                    size={18}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 42px 12px 42px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.95rem",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="button button-primary"
                style={{
                  width: "100%",
                  minHeight: "48px",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  cursor: loginLoading ? "not-allowed" : "pointer",
                  opacity: loginLoading ? 0.75 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loginLoading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Authenticate & Access Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Box */}
            <div
              style={{
                marginTop: "24px",
                padding: "14px 16px",
                background: "#f8fafc",
                borderRadius: "8px",
                border: "1px dashed #cbd5e1",
                fontSize: "0.82rem",
                color: "#475569",
              }}
            >
              <div
                style={{
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "4px",
                }}
              >
                Default System Credentials:
              </div>
              <div>
                Email: <code>admin@gsc-qatar.com</code>
              </div>
              <div>
                Password: <code>admin123456</code>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Link
                to="/"
                style={{
                  fontSize: "0.86rem",
                  color: "#071727",
                  fontWeight: "600",
                  textDecoration: "underline",
                }}
              >
                ← Return to Public Website
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // AUTHENTICATED: RENDER FULL ADMIN DASHBOARD
  return (
    <main style={{ background: "#f8fafc", minHeight: "90vh", paddingBottom: "60px" }}>
      {/* Top Admin Bar */}
      <section
        style={{
          background: "#071727",
          color: "#ffffff",
          padding: "20px 0",
          borderBottom: "2px solid #d7a928",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    background: "#d7a928",
                    color: "#071727",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "800",
                    letterSpacing: "0.08em",
                  }}
                >
                  ADMIN
                </div>
                <h1 style={{ fontSize: "1.35rem", margin: 0, color: "#ffffff" }}>
                  GSC Operations Portal
                </h1>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#94a3b8",
                  margin: "4px 0 0",
                }}
              >
                Logged in as: <strong>{adminUser?.email || "admin@gsc-qatar.com"}</strong> • Doha Head Office
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={loadDashboardData}
                disabled={loadingData}
                className="button button-outline"
                style={{
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.3)",
                  padding: "8px 14px",
                  fontSize: "0.85rem",
                }}
              >
                <RefreshCw size={15} className={loadingData ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>

              <Link
                to="/"
                target="_blank"
                className="button button-outline"
                style={{
                  color: "#ffffff",
                  borderColor: "rgba(255,255,255,0.3)",
                  padding: "8px 14px",
                  fontSize: "0.85rem",
                }}
              >
                <ExternalLink size={15} />
                <span>Live Site</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="button"
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Nav Tabs */}
      <section style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              padding: "8px 0",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "overview" ? "#071727" : "transparent",
                color: activeTab === "overview" ? "#ffffff" : "#475569",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <Activity size={16} color={activeTab === "overview" ? "#d7a928" : "#64748b"} />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("quotes")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "quotes" ? "#071727" : "transparent",
                color: activeTab === "quotes" ? "#ffffff" : "#475569",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <FileText size={16} color={activeTab === "quotes" ? "#d7a928" : "#64748b"} />
              <span>Quotation Requests</span>
              {pendingQuotes > 0 && (
                <span
                  style={{
                    background: "#d7a928",
                    color: "#071727",
                    borderRadius: "999px",
                    padding: "2px 7px",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                  }}
                >
                  {pendingQuotes}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("contacts")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "contacts" ? "#071727" : "transparent",
                color: activeTab === "contacts" ? "#ffffff" : "#475569",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <MessageSquare size={16} color={activeTab === "contacts" ? "#d7a928" : "#64748b"} />
              <span>Inquiries</span>
              {newContacts > 0 && (
                <span
                  style={{
                    background: "#3b82f6",
                    color: "#ffffff",
                    borderRadius: "999px",
                    padding: "2px 7px",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                  }}
                >
                  {newContacts}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("health")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "health" ? "#071727" : "transparent",
                color: activeTab === "health" ? "#ffffff" : "#475569",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <ShieldCheck size={16} color={activeTab === "health" ? "#d7a928" : "#64748b"} />
              <span>System Health</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="container" style={{ marginTop: "30px" }}>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            {/* Metric Cards Row */}
            <div className="four-column" style={{ marginBottom: "30px" }}>
              <div
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600" }}>
                  TOTAL QUOTE REQUESTS
                </div>
                <div
                  style={{
                    fontSize: "2.1rem",
                    fontWeight: "800",
                    color: "#071727",
                    margin: "8px 0 4px",
                  }}
                >
                  {totalQuotes}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#166534" }}>
                  Active client applications
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: "#d97706", fontSize: "0.85rem", fontWeight: "600" }}>
                  PENDING REVIEW
                </div>
                <div
                  style={{
                    fontSize: "2.1rem",
                    fontWeight: "800",
                    color: "#d97706",
                    margin: "8px 0 4px",
                  }}
                >
                  {pendingQuotes}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Needs commercial response
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: "#2563eb", fontSize: "0.85rem", fontWeight: "600" }}>
                  UNDER REVIEW / QUOTED
                </div>
                <div
                  style={{
                    fontSize: "2.1rem",
                    fontWeight: "800",
                    color: "#2563eb",
                    margin: "8px 0 4px",
                  }}
                >
                  {underReviewQuotes + approvedQuotes}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Estimates in pipeline
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600" }}>
                  TOTAL INQUIRIES
                </div>
                <div
                  style={{
                    fontSize: "2.1rem",
                    fontWeight: "800",
                    color: "#071727",
                    margin: "8px 0 4px",
                  }}
                >
                  {totalContacts}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#3b82f6" }}>
                  {newContacts} new messages
                </div>
              </div>
            </div>

            {/* Recent Quotes Quick Table */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "26px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#071727" }}>
                  Recent Quotation Inquiries
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("quotes")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#d7a928",
                    fontWeight: "700",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  View All Quotes →
                </button>
              </div>

              {quotes.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                  No quotation requests received yet.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b", fontSize: "0.82rem" }}>
                        <th style={{ padding: "10px 14px" }}>REF ID</th>
                        <th style={{ padding: "10px 14px" }}>CLIENT NAME</th>
                        <th style={{ padding: "10px 14px" }}>SERVICE</th>
                        <th style={{ padding: "10px 14px" }}>LOCATION</th>
                        <th style={{ padding: "10px 14px" }}>STATUS</th>
                        <th style={{ padding: "10px 14px" }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.slice(0, 5).map((q) => (
                        <tr
                          key={q._id || q.referenceId}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            fontSize: "0.88rem",
                          }}
                        >
                          <td style={{ padding: "12px 14px", fontWeight: "700", color: "#071727" }}>
                            {q.referenceId}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontWeight: "600" }}>{q.name}</div>
                            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{q.company || q.email}</div>
                          </td>
                          <td style={{ padding: "12px 14px" }}>{q.service}</td>
                          <td style={{ padding: "12px 14px", color: "#64748b" }}>{q.location}</td>
                          <td style={{ padding: "12px 14px" }}>{getStatusBadge(q.status)}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab("quotes");
                                openQuoteModal(q);
                              }}
                              style={{
                                padding: "6px 12px",
                                background: "#071727",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QUOTATIONS TAB */}
        {activeTab === "quotes" && (
          <div>
            {/* Filter Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[
                  "All",
                  "Pending",
                  "Under Review",
                  "Quotation Sent",
                  "Approved",
                  "Declined",
                ].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setQuoteFilter(st)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      border: "none",
                      background: quoteFilter === st ? "#071727" : "#ffffff",
                      color: quoteFilter === st ? "#ffffff" : "#475569",
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ position: "relative", minWidth: "260px" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search Ref, Client, Email..."
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 36px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Quotes Table */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              {filteredQuotes.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
                  No quote requests match your filter.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#64748b", fontSize: "0.82rem" }}>
                        <th style={{ padding: "12px 16px" }}>REF NUMBER</th>
                        <th style={{ padding: "12px 16px" }}>CUSTOMER</th>
                        <th style={{ padding: "12px 16px" }}>CONTACT</th>
                        <th style={{ padding: "12px 16px" }}>DIVISION</th>
                        <th style={{ padding: "12px 16px" }}>LOCATION</th>
                        <th style={{ padding: "12px 16px" }}>STATUS</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuotes.map((q) => (
                        <tr
                          key={q._id || q.referenceId}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            fontSize: "0.88rem",
                          }}
                        >
                          <td style={{ padding: "14px 16px", fontWeight: "700", color: "#071727" }}>
                            {q.referenceId}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: "700" }}>{q.name}</div>
                            {q.company && (
                              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                {q.company}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <div>{q.phone}</div>
                            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{q.email}</div>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ fontWeight: "600" }}>{q.service}</span>
                          </td>
                          <td style={{ padding: "14px 16px", color: "#64748b" }}>{q.location}</td>
                          <td style={{ padding: "14px 16px" }}>{getStatusBadge(q.status)}</td>
                          <td style={{ padding: "14px 16px", textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => openQuoteModal(q)}
                              style={{
                                padding: "6px 12px",
                                background: "#071727",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                marginRight: "6px",
                              }}
                            >
                              Manage
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuote(q._id || q.referenceId)}
                              style={{
                                padding: "6px 8px",
                                background: "#fee2e2",
                                color: "#dc2626",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                              title="Delete record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTACTS TAB */}
        {activeTab === "contacts" && (
          <div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              {["All", "New", "In Progress", "Resolved"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setContactFilter(st)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    border: "none",
                    background: contactFilter === st ? "#071727" : "#ffffff",
                    color: contactFilter === st ? "#ffffff" : "#475569",
                    cursor: "pointer",
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              {filteredContacts.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
                  No messages found in inbox.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#64748b", fontSize: "0.82rem" }}>
                        <th style={{ padding: "12px 16px" }}>SENDER</th>
                        <th style={{ padding: "12px 16px" }}>SUBJECT</th>
                        <th style={{ padding: "12px 16px" }}>PHONE</th>
                        <th style={{ padding: "12px 16px" }}>STATUS</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((c) => (
                        <tr
                          key={c._id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            fontSize: "0.88rem",
                          }}
                        >
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: "700" }}>{c.name}</div>
                            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{c.email}</div>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: "600" }}>{c.subject}</div>
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "#64748b",
                                maxWidth: "340px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {c.message}
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px" }}>{c.phone}</td>
                          <td style={{ padding: "14px 16px" }}>{getStatusBadge(c.status)}</td>
                          <td style={{ padding: "14px 16px", textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => setSelectedContact(c)}
                              style={{
                                padding: "6px 12px",
                                background: "#071727",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                marginRight: "6px",
                              }}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(c._id)}
                              style={{
                                padding: "6px 8px",
                                background: "#fee2e2",
                                color: "#dc2626",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SYSTEM HEALTH TAB */}
        {activeTab === "health" && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "30px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <ShieldCheck size={28} color="#166534" />
              <h2 style={{ margin: 0, fontSize: "1.3rem", color: "#071727" }}>
                API Server & Service Status
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
              <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>BACKEND STATUS</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#166534", marginTop: "4px" }}>
                  ● {healthInfo?.status === "ok" ? "Operational (Healthy)" : "Checking..."}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px" }}>
                  Endpoint: {healthInfo?.endpoint || (typeof window !== "undefined" ? window.location.origin + "/api" : "/api")}
                </div>
              </div>

              <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>DATABASE ENGINE</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#071727", marginTop: "4px" }}>
                  {healthInfo?.database?.status || "Active"}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px" }}>
                  Engine: {healthInfo?.database?.engine || "MySQL / Server Database"}
                </div>
              </div>

              <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>SERVER UPTIME</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#071727", marginTop: "4px" }}>
                  {healthInfo?.uptime || "Running"}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px" }}>
                  System: {healthInfo?.system || healthInfo?.engine || "GSC Doha API Service"}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* QUOTE MANAGE MODAL */}
      {selectedQuote && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              padding: "26px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "14px",
                marginBottom: "18px",
              }}
            >
              <div>
                <span
                  style={{
                    background: "#071727",
                    color: "#d7a928",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "800",
                  }}
                >
                  {selectedQuote.referenceId}
                </span>
                <h2 style={{ fontSize: "1.25rem", margin: "6px 0 0", color: "#071727" }}>
                  Manage Proposal Ticket
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                }}
              >
                ✕
              </button>
            </div>

            {actionSuccess && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#dcfce7",
                  color: "#166534",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "0.85rem",
                }}
              >
                ✓ {actionSuccess}
              </div>
            )}

            {/* Client Info Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                background: "#f8fafc",
                padding: "14px",
                borderRadius: "8px",
                marginBottom: "18px",
                fontSize: "0.85rem",
              }}
            >
              <div>
                <span style={{ color: "#64748b" }}>Client Name:</span>
                <div style={{ fontWeight: "700" }}>{selectedQuote.name}</div>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Company:</span>
                <div style={{ fontWeight: "700" }}>{selectedQuote.company || "N/A"}</div>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Email:</span>
                <div>
                  <a href={`mailto:${selectedQuote.email}`} style={{ color: "#071727", textDecoration: "underline" }}>
                    {selectedQuote.email}
                  </a>
                </div>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Phone (Qatar):</span>
                <div>
                  <a
                    href={`https://wa.me/${selectedQuote.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#16a34a", fontWeight: "600", textDecoration: "underline" }}
                  >
                    {selectedQuote.phone} (WhatsApp)
                  </a>
                </div>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Service Division:</span>
                <div style={{ fontWeight: "700" }}>{selectedQuote.service}</div>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Location:</span>
                <div>{selectedQuote.location}</div>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Timeline:</span>
                <div>{selectedQuote.timeline}</div>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Contract Model:</span>
                <div>{selectedQuote.contractType}</div>
              </div>
            </div>

            {/* Scope / Notes */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                Client Project Specifications / Scope:
              </label>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.88rem",
                  color: "#334155",
                  lineHeight: "1.5",
                }}
              >
                {selectedQuote.notes}
              </div>
            </div>

            {/* Admin Controls */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Proposal Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="Pending">Pending (New Submission)</option>
                  <option value="Under Review">Under Review (Estimator Assigned)</option>
                  <option value="Quotation Sent">Quotation Sent (Formal Offer Delivered)</option>
                  <option value="Approved">Approved (Client Contract Signed)</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Estimated Proposal Budget (QAR)
                </label>
                <input
                  type="text"
                  placeholder="e.g. QAR 25,000 / month or QAR 85,000"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Internal Commercial Notes (Visible to Staff Only)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Site visited by Engineer, mobilization feasible within 5 days..."
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                  }}
                ></textarea>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="button button-outline"
                  style={{ padding: "8px 16px", fontSize: "0.88rem" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleUpdateQuote}
                  className="button button-primary"
                  style={{ padding: "8px 20px", fontSize: "0.88rem" }}
                >
                  {actionLoading ? "Saving..." : "Save Proposal Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT MESSAGE VIEW MODAL */}
      {selectedContact && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              padding: "26px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#071727" }}>
                Inquiry Message
              </h2>
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>From:</div>
              <div style={{ fontWeight: "700", fontSize: "1rem" }}>{selectedContact.name}</div>
              <div style={{ fontSize: "0.85rem", color: "#334155" }}>
                {selectedContact.email} • {selectedContact.phone}
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Subject:</div>
              <div style={{ fontWeight: "600", fontSize: "0.92rem" }}>{selectedContact.subject}</div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "4px" }}>Message:</div>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                }}
              >
                {selectedContact.message}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => handleUpdateContact(selectedContact._id, "In Progress")}
                  style={{
                    padding: "6px 12px",
                    background: "#dbeafe",
                    color: "#1e40af",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Mark In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateContact(selectedContact._id, "Resolved")}
                  style={{
                    padding: "6px 12px",
                    background: "#dcfce7",
                    color: "#166534",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Mark Resolved
                </button>
              </div>

              <a
                href={`mailto:${selectedContact.email}?subject=Re:%20${encodeURIComponent(
                  selectedContact.subject
                )}`}
                className="button button-navy"
                style={{ padding: "6px 14px", fontSize: "0.82rem" }}
              >
                Reply by Email
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminPortal;
