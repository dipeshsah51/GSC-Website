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
  User,
  Database,
  Server,
  Globe,
  CheckCircle2,
  ShieldAlert,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  XCircle,
  PlusCircle,
  Printer,
  Briefcase,
  PieChart,
  Filter,
  Building2,
  Calendar,
  Check,
  Calculator,
  Sparkles,
  MapPin,
  Copy,
  Tag,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  loginAdmin,
  updateAdminPassword,
  getAdminQuotes,
  updateQuoteStatus,
  deleteQuote,
  getAdminContacts,
  updateContactStatus,
  deleteContact,
  checkApiHealth,
  getAccountingSummary,
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  getWorks,
  createWork,
  updateWork,
  deleteWork,
  purgeDummyAccounting,
  createManualWorkEntry,
} from "../services/api";

function AdminPortal() {
  const { theme, toggleTheme, isDark } = useTheme();

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
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'accounting' | 'works' | 'quotes' | 'contacts' | 'health' | 'account'
  const [loadingData, setLoadingData] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [healthInfo, setHealthInfo] = useState(null);
  const [lastSyncedTime, setLastSyncedTime] = useState("");

  // Accounting & Operations state
  const [accountingSummary, setAccountingSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [works, setWorks] = useState([]);
  const [paymentFilterType, setPaymentFilterType] = useState("All"); // All | Online | Offline
  const [paymentFilterStatus, setPaymentFilterStatus] = useState("All"); // All | Completed | Pending | Cancelled
  const [paymentSearch, setPaymentSearch] = useState("");
  const [workFilterStatus, setWorkFilterStatus] = useState("All"); // All | In Progress | Completed | Pending | Cancelled
  const [workSearch, setWorkSearch] = useState("");

  // Accounting & Work Modals State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    title: "",
    clientName: "",
    amount: "",
    costExpense: "0",
    paymentType: "Online",
    gatewayMethod: "Credit Card (Visa/Mastercard)",
    status: "Completed",
    notes: "",
  });

  const [showWorkModal, setShowWorkModal] = useState(false);
  const [newWork, setNewWork] = useState({
    title: "",
    clientName: "",
    serviceCategory: "Deep Cleaning & Disinfection",
    location: "Doha, Qatar",
    contractValue: "",
    paidAmount: "0",
    status: "In Progress",
    paymentStatus: "Partial",
    startDate: new Date().toISOString().split("T")[0],
    targetCompletionDate: "",
    notes: "",
  });

  const [receiptPayment, setReceiptPayment] = useState(null);

  // Manual Work Entry & Accounting Auto-Calculator State
  const [manualServiceType, setManualServiceType] = useState("normal"); // 'normal' | 'deep' | 'custom'
  const [normalMaterials, setNormalMaterials] = useState("without"); // 'without' | 'with'
  const [normalHours, setNormalHours] = useState(4);
  const [normalStaff, setNormalStaff] = useState(1);
  const [deepPropertyType, setDeepPropertyType] = useState("1_bhk"); // '1_bhk' | 'studio' | '2_bhk' | '3_bhk' | 'villa' | 'custom'
  const [deepCustomBase, setDeepCustomBase] = useState(300);
  const [deepSofaSeats, setDeepSofaSeats] = useState(0);
  const [deepCarpetArea, setDeepCarpetArea] = useState(0);
  const [deepExtraName, setDeepExtraName] = useState("");
  const [deepExtraPrice, setDeepExtraPrice] = useState(0);
  const [customServiceName, setCustomServiceName] = useState("");
  const [customServiceAmount, setCustomServiceAmount] = useState("");

  // Location & Booking Confirmation Details
  const [entryClientName, setEntryClientName] = useState("");
  const [entryClientPhone, setEntryClientPhone] = useState("");
  const [entryClientEmail, setEntryClientEmail] = useState("");
  const [entryLocation, setEntryLocation] = useState("Doha, Qatar");
  const [entryBuildingNo, setEntryBuildingNo] = useState("");
  const [entryFloorNo, setEntryFloorNo] = useState("");
  const [entryFlatNo, setEntryFlatNo] = useState("");
  const [entryBluePlate, setEntryBluePlate] = useState("");
  const [entryTransportType, setEntryTransportType] = useState("inside"); // 'inside' | 'outside'
  const [entryTransportCharge, setEntryTransportCharge] = useState(20);

  // Financial Adjustments, Discount & Direct Expenses
  const [entryDiscount, setEntryDiscount] = useState(0);
  const [entryCostExpense, setEntryCostExpense] = useState(0);
  const [entryPaymentMethod, setEntryPaymentMethod] = useState("Cash on Site (Offline)");
  const [entryPaymentStatus, setEntryPaymentStatus] = useState("Completed");
  const [entryWorkStatus, setEntryWorkStatus] = useState("Completed");
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [entryNotes, setEntryNotes] = useState("");

  // Post-entry receipt & WhatsApp share
  const [completedVoucher, setCompletedVoucher] = useState(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [submittingEntry, setSubmittingEntry] = useState(false);

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

  // Account / Password Management state
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdAdminName, setPwdAdminName] = useState(() => adminUser?.name || "GSC System Administrator");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");

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

  // Handle Password & Profile Update
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSuccess("");
    setPwdError("");

    if (!pwdNew || pwdNew.length < 6) {
      setPwdError("New password must be at least 6 characters long.");
      return;
    }

    if (pwdNew !== pwdConfirm) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    setPwdLoading(true);
    try {
      const res = await updateAdminPassword(token, {
        currentPassword: pwdCurrent,
        newPassword: pwdNew,
        name: pwdAdminName,
      });

      setPwdSuccess(res.message || "Account credentials updated successfully!");
      setPwdCurrent("");
      setPwdNew("");
      setPwdConfirm("");

      if (adminUser) {
        const updated = { ...adminUser, name: pwdAdminName };
        setAdminUser(updated);
        localStorage.setItem("gsc_admin_user", JSON.stringify(updated));
      }
    } catch (err) {
      setPwdError(err.message || "Failed to update password. Check current credentials.");
    } finally {
      setPwdLoading(false);
    }
  };

  // Fetch Dashboard Data (supports real-time silent background sync)
  const loadDashboardData = async (silent = false) => {
    if (!token) return;
    if (!silent) setLoadingData(true);
    setActionSuccess("");

    try {
      const [quotesRes, contactsRes, healthRes, summaryRes, paymentsRes, worksRes] = await Promise.allSettled([
        getAdminQuotes(token),
        getAdminContacts(token),
        checkApiHealth(),
        getAccountingSummary(token),
        getPayments(token),
        getWorks(token),
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
      if (summaryRes.status === "fulfilled" && summaryRes.value) {
        setAccountingSummary(summaryRes.value);
      }
      if (paymentsRes.status === "fulfilled" && paymentsRes.value) {
        setPayments(paymentsRes.value);
      }
      if (worksRes.status === "fulfilled" && worksRes.value) {
        setWorks(worksRes.value);
      }
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error("Dashboard refresh error:", err);
    } finally {
      if (!silent) setLoadingData(false);
    }
  };

  // Real-time automatic background polling every 12 seconds
  useEffect(() => {
    if (!token) return;
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [token]);

  // Handle Purge Mock / Demo Data to run strictly on real-time data
  const handlePurgeDummy = async (wipeAll = false) => {
    const confirmText = wipeAll
      ? "Reset all accounting records and work contracts to 0? (Fresh slate)"
      : "Purge all demo/seeded mock records from database? Genuine admin-added records will remain intact.";
    if (!window.confirm(confirmText)) return;
    setActionLoading(true);
    try {
      await purgeDummyAccounting(token, wipeAll);
      await loadDashboardData(false);
      alert("Mock records purged successfully! Real-time accounting is now 100% active.");
    } catch (err) {
      alert("Failed to purge mock data: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

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

  // Handle Create Payment
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await createPayment(token, newPayment);
      setShowPaymentModal(false);
      setNewPayment({
        title: "",
        clientName: "",
        amount: "",
        costExpense: "0",
        paymentType: "Online",
        gatewayMethod: "Credit Card (Visa/Mastercard)",
        status: "Completed",
        notes: "",
      });
      loadDashboardData();
    } catch (err) {
      alert("Failed to record payment: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Update Payment Status (Instant 0ms optimistic update)
  const handleUpdatePaymentStatus = async (id, status) => {
    setPayments((prev) =>
      prev.map((p) =>
        p._id === id || p.id === id || p.transaction_id === id
          ? { ...p, status, payment_status: status }
          : p
      )
    );
    try {
      await updatePayment(token, id, { status });
      loadDashboardData(true);
    } catch (err) {
      alert("Failed to update payment status: " + err.message);
      loadDashboardData(true);
    }
  };

  // Handle Delete Payment (Instant 0ms optimistic removal)
  const handleDeletePayment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    setPayments((prev) => prev.filter((p) => p._id !== id && p.id !== id && p.transaction_id !== id));
    try {
      await deletePayment(token, id);
      loadDashboardData(true);
    } catch (err) {
      alert("Failed to delete payment: " + err.message);
      loadDashboardData(true);
    }
  };

  // Handle Create Work Order
  const handleCreateWork = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await createWork(token, newWork);
      setShowWorkModal(false);
      setNewWork({
        title: "",
        clientName: "",
        serviceCategory: "Deep Cleaning & Disinfection",
        location: "Doha, Qatar",
        contractValue: "",
        paidAmount: "0",
        status: "In Progress",
        paymentStatus: "Partial",
        startDate: new Date().toISOString().split("T")[0],
        targetCompletionDate: "",
        notes: "",
      });
      loadDashboardData();
    } catch (err) {
      alert("Failed to create work order: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Update Work Status (Instant 0ms optimistic update)
  const handleUpdateWorkStatus = async (id, status) => {
    setWorks((prev) =>
      prev.map((w) =>
        w._id === id || w.id === id || w.work_id === id || w.work_order_no === id
          ? { ...w, status, work_status: status }
          : w
      )
    );
    try {
      await updateWork(token, id, { status });
      loadDashboardData(true);
    } catch (err) {
      alert("Failed to update work status: " + err.message);
      loadDashboardData(true);
    }
  };

  // Handle Delete Work (Instant 0ms optimistic removal)
  const handleDeleteWork = async (id) => {
    if (!window.confirm("Are you sure you want to delete this work order?")) return;
    setWorks((prev) => prev.filter((w) => w._id !== id && w.id !== id && w.work_id !== id && w.work_order_no !== id));
    try {
      await deleteWork(token, id);
      loadDashboardData(true);
    } catch (err) {
      alert("Failed to delete work order: " + err.message);
      loadDashboardData(true);
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

  // Currency Formatter
  const formatQAR = (num) => {
    const val = Number(num) || 0;
    return "QAR " + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Manual Work Entry & Pricing Calculator Engine
  const calculateManualEntry = () => {
    let baseRate = 0;
    let baseTitle = "";
    const addOns = [];
    let addOnsTotal = 0;

    if (manualServiceType === "normal") {
      const staff = Math.max(1, Number(normalStaff) || 1);
      const hours = Math.max(1, Number(normalHours) || 1);

      if (normalMaterials === "without") {
        // Without materials: 100 QR (1–5 hrs, 1 female staff, inside Doha)
        const extraHours = hours > 5 ? hours - 5 : 0;
        const extraHoursCost = extraHours * 20 * staff;
        baseRate = 100 * staff + extraHoursCost;
        baseTitle = `Normal Cleaning (Without Materials, ${hours} hrs, ${staff} Staff)`;
      } else {
        // With materials: 30 QR/hour (Min. 4 hrs = 120 QR total)
        const billableHours = Math.max(4, hours);
        baseRate = billableHours * 30 * staff;
        baseTitle = `Normal Cleaning (With Materials, ${billableHours} hrs @ 30 QR/hr, ${staff} Staff)`;
      }
    } else if (manualServiceType === "deep") {
      // Deep Cleaning (4 Male Staff – 1 Team): 1 BHK – 300 QR
      if (deepPropertyType === "1_bhk") {
        baseRate = 300;
        baseTitle = "Deep Cleaning 1 BHK (4 Male Staff Team with Full Equipment)";
      } else if (deepPropertyType === "studio") {
        baseRate = 250;
        baseTitle = "Deep Cleaning Studio (4 Male Staff Team)";
      } else if (deepPropertyType === "2_bhk") {
        baseRate = 450;
        baseTitle = "Deep Cleaning 2 BHK (4 Male Staff Team)";
      } else if (deepPropertyType === "3_bhk") {
        baseRate = 600;
        baseTitle = "Deep Cleaning 3 BHK (4 Male Staff Team)";
      } else if (deepPropertyType === "villa") {
        baseRate = 900;
        baseTitle = "Deep Cleaning Villa / Penthouse (4 Male Staff Team)";
      } else {
        baseRate = Number(deepCustomBase) || 300;
        baseTitle = `Deep Cleaning Custom Property (4 Male Staff Team)`;
      }

      // Sofa – 30 QR per seat
      const sofaCount = Math.max(0, Number(deepSofaSeats) || 0);
      if (sofaCount > 0) {
        const sofaAmt = sofaCount * 30;
        addOns.push({ label: `Sofa Shampoo Cleaning (${sofaCount} seats @ 30 QR)`, amount: sofaAmt });
        addOnsTotal += sofaAmt;
      }

      // Carpet – 10 QR/m²
      const carpetM2 = Math.max(0, Number(deepCarpetArea) || 0);
      if (carpetM2 > 0) {
        const carpetAmt = carpetM2 * 10;
        addOns.push({ label: `Carpet Deep Extraction (${carpetM2} m² @ 10 QR)`, amount: carpetAmt });
        addOnsTotal += carpetAmt;
      }

      // Additional services on request (Mattress, Curtains, etc.)
      const extraAmt = Math.max(0, Number(deepExtraPrice) || 0);
      if (extraAmt > 0) {
        addOns.push({ label: deepExtraName || "Additional Specialty Cleaning", amount: extraAmt });
        addOnsTotal += extraAmt;
      }
    } else {
      // Custom specialized contracting
      baseRate = Number(customServiceAmount) || 0;
      baseTitle = customServiceName || "Custom Contracting Service";
    }

    // Transport Charge (Outside Doha: 15–30 QR depending on location)
    const transportAmt = entryTransportType === "outside" ? Math.max(0, Number(entryTransportCharge) || 20) : 0;

    // Subtotal before discount
    const grossSubtotal = baseRate + addOnsTotal + transportAmt;

    // Optional Discount
    const disc = Math.max(0, Number(entryDiscount) || 0);

    // Final Customer Amount
    const finalAmount = Math.max(0, grossSubtotal - disc);

    // Direct Cost / Expenses (staff pay, fuel, chemicals)
    const directCost = Math.max(0, Number(entryCostExpense) || 0);

    // Net Operating Profit
    const netProfit = finalAmount - directCost;
    const profitMargin = finalAmount > 0 ? ((netProfit / finalAmount) * 100).toFixed(1) : "0.0";

    // Itemized breakdown text for receipt and WhatsApp
    const breakdownLines = [
      `• Base Service: ${baseTitle} = QAR ${baseRate.toFixed(2)}`,
      ...addOns.map((a) => `• Add-on: ${a.label} = QAR ${a.amount.toFixed(2)}`),
      transportAmt > 0 ? `• Transport Charge (Outside Doha): QAR ${transportAmt.toFixed(2)}` : `• Transport: Inside Doha (Free)`,
      disc > 0 ? `• Special Discount: -QAR ${disc.toFixed(2)}` : null,
      `• Total Amount to Collect: QAR ${finalAmount.toFixed(2)}`,
      directCost > 0 ? `• Direct Job Cost: QAR ${directCost.toFixed(2)} (Net Profit: QAR ${netProfit.toFixed(2)})` : null
    ].filter(Boolean).join("\n");

    return {
      baseRate,
      baseTitle,
      addOns,
      addOnsTotal,
      transportAmt,
      grossSubtotal,
      discountAmt: disc,
      finalAmount,
      directCost,
      netProfit,
      profitMargin,
      breakdownText: breakdownLines
    };
  };

  // Submit Completed Work & Accounting Entry
  const handleSubmitManualEntry = async (e) => {
    e.preventDefault();
    setSubmittingEntry(true);

    try {
      const calc = calculateManualEntry();
      const payload = {
        clientName: entryClientName.trim() || "Valued Client",
        clientPhone: entryClientPhone.trim() || "",
        clientEmail: entryClientEmail.trim() || "",
        location: entryLocation.trim() || "Doha, Qatar",
        buildingNo: entryBuildingNo.trim() || "",
        floorNo: entryFloorNo.trim() || "",
        flatNo: entryFlatNo.trim() || "",
        serviceCategory: manualServiceType === "normal"
          ? "Normal Cleaning (Female Staff)"
          : manualServiceType === "deep"
          ? "Deep Cleaning (4 Male Staff Team)"
          : "Specialized Contracting",
        title: calc.baseTitle,
        subtotal: calc.grossSubtotal,
        transportCharge: calc.transportAmt,
        discount: calc.discountAmt,
        amount: calc.finalAmount,
        costExpense: calc.directCost,
        netProfit: calc.netProfit,
        paymentMethod: entryPaymentMethod,
        paymentType: entryPaymentMethod.toLowerCase().includes("online") || entryPaymentMethod.toLowerCase().includes("card") || entryPaymentMethod.toLowerCase().includes("wire") ? "Online" : "Offline",
        paymentStatus: entryPaymentStatus,
        workStatus: entryWorkStatus,
        date: entryDate,
        breakdown: calc.breakdownText,
        notes: [
          entryBluePlate ? `Blue Plate / Zone Info: ${entryBluePlate}` : "",
          entryNotes ? `Admin Notes: ${entryNotes}` : ""
        ].filter(Boolean).join(" | ")
      };

      const res = await createManualWorkEntry(token, payload);
      if (res && res.success) {
        setCompletedVoucher(res.data);
        if (res.data) {
          const d = res.data;
          setWorks((prev) => [
            {
              _id: d.work_id || "WRK-" + Date.now(),
              work_id: d.work_id,
              work_order_no: d.work_id,
              title: payload.title,
              client_name: payload.clientName,
              service_category: payload.serviceCategory,
              location: payload.location,
              contract_value: Number(payload.amount),
              paid_amount: Number(payload.amount),
              status: "Completed",
              work_status: "Completed",
              created_at: payload.date,
            },
            ...prev,
          ]);
          setPayments((prev) => [
            {
              _id: d.transaction_id || "TXN-" + Date.now(),
              transaction_id: d.transaction_id,
              invoice_no: d.invoice_no,
              client_name: payload.clientName,
              title: payload.title,
              amount: Number(payload.amount),
              cost_expense: Number(payload.costExpense),
              net_profit: Number(payload.netProfit),
              payment_method: payload.paymentMethod,
              status: "Completed",
              payment_status: "Completed",
              payment_date: payload.date,
            },
            ...prev,
          ]);
        }
        loadDashboardData(true);
      } else {
        alert("Failed to record entry: " + (res.message || "Unknown error"));
      }
    } catch (err) {
      alert("Error submitting work entry: " + err.message);
    } finally {
      setSubmittingEntry(false);
    }
  };

  // Generate WhatsApp formatted text message
  const generateWhatsAppMessage = (voucher) => {
    if (!voucher) return "";
    const calc = calculateManualEntry();
    const phone = entryClientPhone || "On File";
    return `🧹 *GENTING SERVICES & CONTRACTING W.L.L. (DOHA)*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *WORK COMPLETION & OFFICIAL INVOICE*
📄 Invoice No: ${voucher.invoice_no || "INV-GSC-1001"}
🛠️ Work Order: ${voucher.work_id || "WRK-101"}
📅 Date: ${voucher.date || entryDate}
👤 Client: ${voucher.client_name || entryClientName || "Valued Client"}
📞 Contact: ${phone}
📍 Location: ${voucher.location || entryLocation}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *SERVICE & PRICE BREAKDOWN:*
${voucher.breakdown || calc.breakdownText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL AMOUNT: QAR ${Number(voucher.amount).toFixed(2)}*
💳 Payment Method: ${voucher.payment_method || entryPaymentMethod} (${voucher.payment_status || entryPaymentStatus})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for choosing GSC Qatar! 🙏
Looking forward to serving you again!
📍 Doha, Qatar | 📞 +974 7025 2552`;
  };

  // Copy WhatsApp message to clipboard
  const handleCopyWhatsApp = (voucher) => {
    const text = generateWhatsAppMessage(voucher);
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  // Computed metrics - Quotations & Contacts
  const totalQuotes = quotes.length;
  const pendingQuotes = quotes.filter((q) => q.status === "Pending").length;
  const underReviewQuotes = quotes.filter((q) => q.status === "Under Review").length;
  const approvedQuotes = quotes.filter(
    (q) => q.status === "Approved" || q.status === "Quotation Sent"
  ).length;
  const totalContacts = contacts.length;
  const newContacts = contacts.filter((c) => c.status === "New").length;

  // Computed metrics - Accounting & Payments
  const calcGrossRevenue = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const calcTotalExpenses = payments.reduce(
    (sum, p) => sum + Number(p.cost_expense ?? p.costExpense ?? 0),
    0
  );
  const totalGrossRevenue = accountingSummary?.totalRevenue ?? calcGrossRevenue;
  const totalDirectExpenses = accountingSummary?.totalExpenses ?? calcTotalExpenses;
  const netCompanyProfit = accountingSummary?.netProfit ?? (totalGrossRevenue - totalDirectExpenses);
  const profitMarginPercent = totalGrossRevenue > 0
    ? ((netCompanyProfit / totalGrossRevenue) * 100).toFixed(1)
    : "0.0";

  const onlineRevenue = accountingSummary?.onlineRevenue ?? payments
    .filter((p) => (p.payment_type || p.paymentType) === "Online" && p.status === "Completed")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const offlineRevenue = accountingSummary?.offlineRevenue ?? payments
    .filter((p) => (p.payment_type || p.paymentType) === "Offline" && p.status === "Completed")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingRevenue = accountingSummary?.pendingRevenue ?? payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const onlineCount = payments.filter((p) => (p.payment_type || p.paymentType) === "Online").length;
  const offlineCount = payments.filter((p) => (p.payment_type || p.paymentType) === "Offline").length;

  // Computed metrics - Works & Operations
  const totalWorksCount = works.length;
  const completedWorksCount = works.filter((w) => w.status === "Completed").length;
  const inProgressWorksCount = works.filter((w) => w.status === "In Progress").length;
  const pendingWorksCount = works.filter((w) => w.status === "Pending").length;
  const cancelledWorksCount = works.filter((w) => w.status === "Cancelled").length;
  const totalContractValue = works.reduce(
    (sum, w) => sum + Number(w.contract_value ?? w.contractValue ?? 0),
    0
  );

  // Filtered lists
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

  const filteredContacts = contacts.filter((c) => {
    return contactFilter === "All" || c.status === contactFilter;
  });

  const filteredPayments = payments.filter((p) => {
    const pType = p.payment_type || p.paymentType;
    const matchesType = paymentFilterType === "All" || pType === paymentFilterType;
    const matchesStatus = paymentFilterStatus === "All" || p.status === paymentFilterStatus;
    const s = paymentSearch.toLowerCase();
    const matchesSearch =
      !s ||
      p.title?.toLowerCase().includes(s) ||
      p.client_name?.toLowerCase().includes(s) ||
      p.clientName?.toLowerCase().includes(s) ||
      p.invoice_no?.toLowerCase().includes(s) ||
      p.gateway_method?.toLowerCase().includes(s) ||
      p.gatewayMethod?.toLowerCase().includes(s);
    return matchesType && matchesStatus && matchesSearch;
  });

  const filteredWorks = works.filter((w) => {
    const matchesStatus = workFilterStatus === "All" || w.status === workFilterStatus;
    const s = workSearch.toLowerCase();
    const matchesSearch =
      !s ||
      w.title?.toLowerCase().includes(s) ||
      w.client_name?.toLowerCase().includes(s) ||
      w.clientName?.toLowerCase().includes(s) ||
      w.work_order_no?.toLowerCase().includes(s) ||
      w.service_category?.toLowerCase().includes(s) ||
      w.serviceCategory?.toLowerCase().includes(s) ||
      w.location?.toLowerCase().includes(s);
    return matchesStatus && matchesSearch;
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
      Completed: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
      Cancelled: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
      Paid: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
      Partial: { background: "#e0e7ff", color: "#3730a3", border: "1px solid #c7d2fe" },
      Unpaid: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
      Resolved: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
      Online: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
      Offline: { background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1" },
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
          background: isDark
            ? "radial-gradient(ellipse at top, #0c1c2e 0%, #07111c 100%)"
            : "linear-gradient(135deg, rgba(7,23,39,0.97) 0%, rgba(13,38,62,0.95) 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            background: isDark ? "#0c1c2e" : "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            overflow: "hidden",
            border: isDark ? "1px solid #1a3250" : "1px solid rgba(215, 169, 40, 0.3)",
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
          <div style={{ padding: "30px", background: isDark ? "#0c1c2e" : "#ffffff" }}>
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
                    color: isDark ? "#cbd5e1" : "#334155",
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
                      border: isDark ? "1.5px solid #1e385b" : "1.5px solid #cbd5e1",
                      background: isDark ? "#071320" : "#ffffff",
                      color: isDark ? "#ffffff" : "#0f172a",
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
                    color: isDark ? "#cbd5e1" : "#334155",
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
                      border: isDark ? "1.5px solid #1e385b" : "1.5px solid #cbd5e1",
                      background: isDark ? "#071320" : "#ffffff",
                      color: isDark ? "#ffffff" : "#0f172a",
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

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <Link
                to="/"
                style={{
                  fontSize: "0.86rem",
                  color: isDark ? "#f5d061" : "#071727",
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
    <main
      style={{
        background: isDark ? "#07111c" : "#f8fafc",
        minHeight: "90vh",
        paddingBottom: "60px",
        color: isDark ? "#e2e8f0" : "#1e293b",
        transition: "background 0.3s ease",
      }}
    >
      {/* Top Admin Bar */}
      <section
        style={{
          background: isDark ? "#09131f" : "#071727",
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
                  flexWrap: "wrap",
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
                  GSC Operations & Finance Portal
                </h1>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(22, 163, 74, 0.2)",
                    border: "1px solid rgba(22, 163, 74, 0.4)",
                    color: "#4ade80",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "0.74rem",
                    fontWeight: "700",
                  }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      boxShadow: "0 0 8px #22c55e",
                      display: "inline-block",
                    }}
                  />
                  <span>Live Real-Time {lastSyncedTime ? `• ${lastSyncedTime}` : ""}</span>
                </div>
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

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => loadDashboardData(false)}
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
                <span>Sync Now</span>
              </button>

              <button
                type="button"
                onClick={() => handlePurgeDummy(false)}
                disabled={actionLoading}
                className="button button-outline"
                title="Purge all demo/seeded mock records from database"
                style={{
                  color: "#fca5a5",
                  borderColor: "rgba(239, 68, 68, 0.4)",
                  background: "rgba(239, 68, 68, 0.1)",
                  padding: "8px 14px",
                  fontSize: "0.85rem",
                }}
              >
                <Trash2 size={15} />
                <span>Purge Mock Data</span>
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
                <Globe size={15} />
                <span>View Public Site</span>
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
      <section
        style={{
          background: isDark ? "#0c1827" : "#ffffff",
          borderBottom: isDark ? "1px solid #1a2f4c" : "1px solid #e2e8f0",
          transition: "background 0.3s ease",
        }}
      >
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
                background:
                  activeTab === "overview"
                    ? isDark
                      ? "#d7a928"
                      : "#071727"
                    : "transparent",
                color:
                  activeTab === "overview"
                    ? isDark
                      ? "#071727"
                      : "#ffffff"
                    : isDark
                    ? "#94a3b8"
                    : "#475569",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <Activity
                size={16}
                color={
                  activeTab === "overview"
                    ? isDark
                      ? "#071727"
                      : "#d7a928"
                    : "#64748b"
                }
              />
              <span>Overview</span>
            </button>

            {/* Manual Work Entry & Auto-Calculator Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("manual-entry")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                background:
                  activeTab === "manual-entry"
                    ? isDark
                      ? "#d7a928"
                      : "#071727"
                    : isDark
                    ? "rgba(215, 169, 40, 0.12)"
                    : "rgba(215, 169, 40, 0.15)",
                color:
                  activeTab === "manual-entry"
                    ? isDark
                      ? "#071727"
                      : "#ffffff"
                    : isDark
                    ? "#d7a928"
                    : "#92400e",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: activeTab === "manual-entry" ? "0 2px 8px rgba(215, 169, 40, 0.3)" : "none",
              }}
            >
              <Calculator
                size={16}
                color={
                  activeTab === "manual-entry"
                    ? isDark
                      ? "#071727"
                      : "#d7a928"
                    : "#d7a928"
                }
              />
              <span>Work Entry & Calculator</span>
              <span
                style={{
                  background: activeTab === "manual-entry" ? "#071727" : "#d7a928",
                  color: activeTab === "manual-entry" ? "#d7a928" : "#071727",
                  borderRadius: "999px",
                  padding: "1px 6px",
                  fontSize: "0.68rem",
                  fontWeight: "800",
                }}
              >
                Auto-Calc
              </span>
            </button>

            {/* Accounting & Finance Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("accounting")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                background:
                  activeTab === "accounting"
                    ? isDark
                      ? "#d7a928"
                      : "#071727"
                    : "transparent",
                color:
                  activeTab === "accounting"
                    ? isDark
                      ? "#071727"
                      : "#ffffff"
                    : isDark
                    ? "#94a3b8"
                    : "#475569",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <DollarSign
                size={16}
                color={
                  activeTab === "accounting"
                    ? isDark
                      ? "#071727"
                      : "#d7a928"
                    : "#64748b"
                }
              />
              <span>Accounting & Payments</span>
              {totalGrossRevenue > 0 && (
                <span
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    borderRadius: "999px",
                    padding: "2px 7px",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                  }}
                >
                  QAR
                </span>
              )}
            </button>

            {/* Work Operations Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("works")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                background:
                  activeTab === "works"
                    ? isDark
                      ? "#d7a928"
                      : "#071727"
                    : "transparent",
                color:
                  activeTab === "works"
                    ? isDark
                      ? "#071727"
                      : "#ffffff"
                    : isDark
                    ? "#94a3b8"
                    : "#475569",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <Briefcase
                size={16}
                color={
                  activeTab === "works"
                    ? isDark
                      ? "#071727"
                      : "#d7a928"
                    : "#64748b"
                }
              />
              <span>Work Operations</span>
              {inProgressWorksCount > 0 && (
                <span
                  style={{
                    background: "#0284c7",
                    color: "#ffffff",
                    borderRadius: "999px",
                    padding: "2px 7px",
                    fontSize: "0.72rem",
                    fontWeight: "800",
                  }}
                >
                  {inProgressWorksCount} Active
                </span>
              )}
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
                background:
                  activeTab === "quotes"
                    ? isDark
                      ? "#d7a928"
                      : "#071727"
                    : "transparent",
                color:
                  activeTab === "quotes"
                    ? isDark
                      ? "#071727"
                      : "#ffffff"
                    : isDark
                    ? "#94a3b8"
                    : "#475569",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <FileText
                size={16}
                color={
                  activeTab === "quotes"
                    ? isDark
                      ? "#071727"
                      : "#d7a928"
                    : "#64748b"
                }
              />
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
                background:
                  activeTab === "contacts"
                    ? isDark
                      ? "#d7a928"
                      : "#071727"
                    : "transparent",
                color:
                  activeTab === "contacts"
                    ? isDark
                      ? "#071727"
                      : "#ffffff"
                    : isDark
                    ? "#94a3b8"
                    : "#475569",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <MessageSquare
                size={16}
                color={
                  activeTab === "contacts"
                    ? isDark
                      ? "#071727"
                      : "#d7a928"
                    : "#64748b"
                }
              />
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
                background:
                  activeTab === "health"
                    ? isDark
                      ? "#d7a928"
                      : "#071727"
                    : "transparent",
                color:
                  activeTab === "health"
                    ? isDark
                      ? "#071727"
                      : "#ffffff"
                    : isDark
                    ? "#94a3b8"
                    : "#475569",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <ShieldCheck
                size={16}
                color={
                  activeTab === "health"
                    ? isDark
                      ? "#071727"
                      : "#d7a928"
                    : "#64748b"
                }
              />
              <span>System Health</span>
            </button>

            {/* Account & Credentials Tab Button */}
            <button
              type="button"
              onClick={() => setActiveTab("account")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                background:
                  activeTab === "account"
                    ? isDark
                      ? "#d7a928"
                      : "#071727"
                    : "transparent",
                color:
                  activeTab === "account"
                    ? isDark
                      ? "#071727"
                      : "#ffffff"
                    : isDark
                    ? "#94a3b8"
                    : "#475569",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <User
                size={16}
                color={
                  activeTab === "account"
                    ? isDark
                      ? "#071727"
                      : "#d7a928"
                    : "#64748b"
                }
              />
              <span>Admin Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="container" style={{ marginTop: "30px" }}>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            {/* Top Row: Executive Financial & Operational KPIs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
                marginBottom: "26px",
              }}
            >
              {/* Gross Revenue Card */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "24px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.8rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                      TOTAL GROSS INFLOW
                    </div>
                    <div
                      style={{
                        fontSize: "1.85rem",
                        fontWeight: "800",
                        color: "#16a34a",
                        margin: "8px 0 4px",
                      }}
                    >
                      {formatQAR(totalGrossRevenue)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(22, 163, 74, 0.12)",
                      color: "#16a34a",
                      padding: "10px",
                      borderRadius: "10px",
                    }}
                  >
                    <DollarSign size={24} />
                  </div>
                </div>
                <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "4px" }}>
                  Online: <strong>{formatQAR(onlineRevenue)}</strong> • Offline: <strong>{formatQAR(offlineRevenue)}</strong>
                </div>
              </div>

              {/* Net Profit Card */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "24px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.8rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                      NET COMPANY PROFIT
                    </div>
                    <div
                      style={{
                        fontSize: "1.85rem",
                        fontWeight: "800",
                        color: "#d7a928",
                        margin: "8px 0 4px",
                      }}
                    >
                      {formatQAR(netCompanyProfit)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(215, 169, 40, 0.15)",
                      color: "#d7a928",
                      padding: "10px",
                      borderRadius: "10px",
                    }}
                  >
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      fontSize: "0.74rem",
                      fontWeight: "700",
                    }}
                  >
                    {profitMarginPercent}% Margin
                  </span>
                  <span style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                    Costs: {formatQAR(totalDirectExpenses)}
                  </span>
                </div>
              </div>

              {/* Works & Contracting Card */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "24px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.8rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                      WORK OPERATIONS
                    </div>
                    <div
                      style={{
                        fontSize: "1.85rem",
                        fontWeight: "800",
                        color: isDark ? "#ffffff" : "#071727",
                        margin: "8px 0 4px",
                      }}
                    >
                      {totalWorksCount} Works
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(2, 132, 199, 0.12)",
                      color: "#0284c7",
                      padding: "10px",
                      borderRadius: "10px",
                    }}
                  >
                    <Briefcase size={24} />
                  </div>
                </div>
                <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "4px" }}>
                  <strong style={{ color: "#16a34a" }}>{completedWorksCount} Completed</strong> •{" "}
                  <strong style={{ color: "#0284c7" }}>{inProgressWorksCount + pendingWorksCount} Active/Pending</strong> •{" "}
                  <strong style={{ color: "#dc2626" }}>{cancelledWorksCount} Cancelled</strong>
                </div>
              </div>

              {/* Quotations Pipeline Card */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "24px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.8rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                      CLIENT QUOTES
                    </div>
                    <div
                      style={{
                        fontSize: "1.85rem",
                        fontWeight: "800",
                        color: isDark ? "#ffffff" : "#071727",
                        margin: "8px 0 4px",
                      }}
                    >
                      {totalQuotes} Requests
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(217, 119, 6, 0.12)",
                      color: "#d97706",
                      padding: "10px",
                      borderRadius: "10px",
                    }}
                  >
                    <FileText size={24} />
                  </div>
                </div>
                <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "4px" }}>
                  <strong style={{ color: "#d97706" }}>{pendingQuotes} Pending Review</strong> •{" "}
                  <span>{newContacts} New Inquiries</span>
                </div>
              </div>
            </div>

            {/* Split Row: Payment Channels Ratio & Contracting Operations Progress */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: "24px",
                marginBottom: "30px",
              }}
            >
              {/* Payment Channels Card */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  borderRadius: "14px",
                  padding: "24px",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CreditCard size={20} color="#d7a928" />
                    <h3 style={{ margin: 0, fontSize: "1.05rem", color: isDark ? "#ffffff" : "#071727" }}>
                      Payment Revenue Channels
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("accounting")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#d7a928",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    Manage Accounting →
                  </button>
                </div>

                {/* Online vs Offline Bars */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "6px" }}>
                    <span>
                      <strong style={{ color: "#2563eb" }}>Online Collections:</strong> {formatQAR(onlineRevenue)} ({onlineCount} Txns)
                    </span>
                    <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
                      {totalGrossRevenue > 0 ? Math.round((onlineRevenue / totalGrossRevenue) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: isDark ? "#142840" : "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${totalGrossRevenue > 0 ? Math.min(100, (onlineRevenue / totalGrossRevenue) * 100) : 0}%`,
                        height: "100%",
                        background: "#2563eb",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "4px" }}>
                    Credit Cards (Visa/Mastercard), QNB Qatar Gateway, Wire Transfers
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: "6px" }}>
                    <span>
                      <strong style={{ color: "#d7a928" }}>Offline Collections:</strong> {formatQAR(offlineRevenue)} ({offlineCount} Txns)
                    </span>
                    <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
                      {totalGrossRevenue > 0 ? Math.round((offlineRevenue / totalGrossRevenue) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: isDark ? "#142840" : "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${totalGrossRevenue > 0 ? Math.min(100, (offlineRevenue / totalGrossRevenue) * 100) : 0}%`,
                        height: "100%",
                        background: "#d7a928",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "4px" }}>
                    On-Site Cash, Corporate PDC Cheques, Point of Sale (POS)
                  </div>
                </div>
              </div>

              {/* Contracting Works Execution Status Card */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  borderRadius: "14px",
                  padding: "24px",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Activity size={20} color="#16a34a" />
                    <h3 style={{ margin: 0, fontSize: "1.05rem", color: isDark ? "#ffffff" : "#071727" }}>
                      Work Contracting Operations
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("works")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#d7a928",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    Manage Work Orders →
                  </button>
                </div>

                {/* Work Status Counters Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div
                    style={{
                      padding: "12px",
                      background: isDark ? "#071320" : "#f0fdf4",
                      borderRadius: "10px",
                      border: isDark ? "1px solid #142840" : "1px solid #bbf7d0",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", color: "#166534", fontWeight: "700" }}>COMPLETED</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#16a34a", margin: "2px 0" }}>
                      {completedWorksCount}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: isDark ? "#94a3b8" : "#64748b" }}>Handed Over</div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      background: isDark ? "#071320" : "#eff6ff",
                      borderRadius: "10px",
                      border: isDark ? "1px solid #142840" : "1px solid #bfdbfe",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", color: "#1e40af", fontWeight: "700" }}>PENDING / ACTIVE</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#2563eb", margin: "2px 0" }}>
                      {inProgressWorksCount + pendingWorksCount}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: isDark ? "#94a3b8" : "#64748b" }}>In Progress</div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      background: isDark ? "#071320" : "#fef2f2",
                      borderRadius: "10px",
                      border: isDark ? "1px solid #142840" : "1px solid #fecaca",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", color: "#991b1b", fontWeight: "700" }}>CANCELLED</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#dc2626", margin: "2px 0" }}>
                      {cancelledWorksCount}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: isDark ? "#94a3b8" : "#64748b" }}>Voided</div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px 14px",
                    background: isDark ? "#071320" : "#f8fafc",
                    borderRadius: "8px",
                    fontSize: "0.84rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>Total Contract Portfolio Value:</span>
                  <strong style={{ color: "#d7a928", fontSize: "0.95rem" }}>{formatQAR(totalContractValue)}</strong>
                </div>
              </div>
            </div>

            {/* Recent Quotes Quick Table */}
            <div
              style={{
                background: isDark ? "#0c1c2e" : "#ffffff",
                borderRadius: "14px",
                padding: "26px",
                border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
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
                <h3 style={{ margin: 0, fontSize: "1.15rem", color: isDark ? "#ffffff" : "#071727" }}>
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
                <div style={{ padding: "40px 20px", textAlign: "center", color: isDark ? "#94a3b8" : "#64748b" }}>
                  No quotation requests received yet.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: isDark ? "2px solid #1a3250" : "2px solid #e2e8f0", color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.82rem" }}>
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
                            borderBottom: isDark ? "1px solid #142840" : "1px solid #f1f5f9",
                            fontSize: "0.88rem",
                          }}
                        >
                          <td style={{ padding: "12px 14px", fontWeight: "700", color: "#d7a928" }}>
                            {q.referenceId}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontWeight: "600", color: isDark ? "#ffffff" : "#0f172a" }}>{q.name}</div>
                            <div style={{ fontSize: "0.78rem", color: isDark ? "#94a3b8" : "#64748b" }}>{q.company || q.email}</div>
                          </td>
                          <td style={{ padding: "12px 14px" }}>{q.service}</td>
                          <td style={{ padding: "12px 14px", color: isDark ? "#94a3b8" : "#64748b" }}>{q.location}</td>
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
                                border: "1px solid #d7a928",
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

        {/* MANUAL WORK ENTRY & PRICING CALCULATOR TAB */}
        {activeTab === "manual-entry" && (
          <div>
            {/* Header Title & Description */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <div
                    style={{
                      background: "rgba(215, 169, 40, 0.15)",
                      color: "#d7a928",
                      padding: "8px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Calculator size={22} />
                  </div>
                  <h2 style={{ fontSize: "1.45rem", margin: 0, color: isDark ? "#ffffff" : "#071727" }}>
                    Completed Work Entry & Auto-Calculating Accounting
                  </h2>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: "0.88rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Official GSC company rates with live automatic calculations, optional discounts, transport fees, and instant database accounting recording.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setEntryClientName("");
                    setEntryClientPhone("");
                    setEntryLocation("Doha, Qatar");
                    setEntryBuildingNo("");
                    setEntryFloorNo("");
                    setEntryFlatNo("");
                    setEntryBluePlate("");
                    setDeepSofaSeats(0);
                    setDeepCarpetArea(0);
                    setDeepExtraName("");
                    setDeepExtraPrice(0);
                    setEntryDiscount(0);
                    setEntryCostExpense(0);
                    setEntryNotes("");
                  }}
                  className="button button-outline"
                  style={{
                    padding: "8px 14px",
                    fontSize: "0.85rem",
                    color: isDark ? "#cbd5e1" : "#475569",
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Reset Form</span>
                </button>
              </div>
            </div>

            {/* Split Form & Real-time Live Calculation Grid */}
            <form onSubmit={handleSubmitManualEntry}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                  gap: "24px",
                  alignItems: "start",
                }}
              >
                {/* LEFT COLUMN: Service Options & Booking Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  
                  {/* CARD 1: Service Type Selector */}
                  <div
                    style={{
                      background: isDark ? "#0c1c2e" : "#ffffff",
                      borderRadius: "14px",
                      padding: "24px",
                      border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <Sparkles size={18} color="#d7a928" />
                      <h3 style={{ margin: 0, fontSize: "1.1rem", color: isDark ? "#ffffff" : "#071727" }}>
                        1. Select Service Category & Scope
                      </h3>
                    </div>

                    {/* Service Type Buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                      <button
                        type="button"
                        onClick={() => setManualServiceType("normal")}
                        style={{
                          padding: "14px",
                          borderRadius: "10px",
                          border: manualServiceType === "normal" ? "2px solid #d7a928" : isDark ? "1px solid #1e385b" : "1px solid #e2e8f0",
                          background: manualServiceType === "normal" ? (isDark ? "rgba(215, 169, 40, 0.15)" : "#fefce8") : (isDark ? "#071320" : "#f8fafc"),
                          color: isDark ? "#ffffff" : "#071727",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "4px" }}>🧹 Normal Cleaning</div>
                        <div style={{ fontSize: "0.78rem", color: isDark ? "#cbd5e1" : "#475569", fontWeight: "600" }}>
                          Indoor Only • Female Staff
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "#16a34a", marginTop: "4px", fontWeight: "700" }}>
                          100 QR (Base) or 30 QR/hr
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setManualServiceType("deep")}
                        style={{
                          padding: "14px",
                          borderRadius: "10px",
                          border: manualServiceType === "deep" ? "2px solid #d7a928" : isDark ? "1px solid #1e385b" : "1px solid #e2e8f0",
                          background: manualServiceType === "deep" ? (isDark ? "rgba(215, 169, 40, 0.15)" : "#fefce8") : (isDark ? "#071320" : "#f8fafc"),
                          color: isDark ? "#ffffff" : "#071727",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "4px" }}>🧼 Deep Cleaning</div>
                        <div style={{ fontSize: "0.78rem", color: isDark ? "#cbd5e1" : "#475569", fontWeight: "600" }}>
                          4 Male Staff • 1 Team with Tools
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "#2563eb", marginTop: "4px", fontWeight: "700" }}>
                          1 BHK = 300 QR + Add-ons
                        </div>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setManualServiceType("custom")}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: manualServiceType === "custom" ? "2px solid #d7a928" : isDark ? "1px solid #1e385b" : "1px solid #e2e8f0",
                        background: manualServiceType === "custom" ? (isDark ? "rgba(215, 169, 40, 0.15)" : "#fefce8") : "transparent",
                        color: isDark ? "#cbd5e1" : "#475569",
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        marginBottom: "16px",
                      }}
                    >
                      🛠️ Or Choose Other Specialized Contracting / Maintenance Job
                    </button>

                    {/* SERVICE DETAILS: NORMAL CLEANING */}
                    {manualServiceType === "normal" && (
                      <div
                        style={{
                          background: isDark ? "#071320" : "#f8fafc",
                          borderRadius: "10px",
                          padding: "18px",
                          border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#475569", marginBottom: "14px", lineHeight: "1.5" }}>
                          <strong>Includes:</strong> Dusting, sweeping, mopping • Vacuuming • Dishwashing • Laundry (washing, ironing, folding) • General home maintenance
                        </div>

                        {/* Material Options */}
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "8px", color: isDark ? "#ffffff" : "#071727" }}>
                          Cleaning Material Package:
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "8px",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              background: normalMaterials === "without" ? "rgba(215, 169, 40, 0.15)" : (isDark ? "#0c1c2e" : "#ffffff"),
                              border: normalMaterials === "without" ? "1.5px solid #d7a928" : isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="radio"
                              name="normalMaterials"
                              checked={normalMaterials === "without"}
                              onChange={() => setNormalMaterials("without")}
                              style={{ marginTop: "3px" }}
                            />
                            <div>
                              <strong style={{ fontSize: "0.85rem", display: "block", color: isDark ? "#ffffff" : "#071727" }}>
                                Without Materials
                              </strong>
                              <span style={{ fontSize: "0.76rem", color: "#16a34a", fontWeight: "700" }}>
                                100 QR (1–5 hrs)
                              </span>
                              <span style={{ fontSize: "0.72rem", color: isDark ? "#94a3b8" : "#64748b", display: "block" }}>
                                1 female staff inside Doha
                              </span>
                            </div>
                          </label>

                          <label
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "8px",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              background: normalMaterials === "with" ? "rgba(215, 169, 40, 0.15)" : (isDark ? "#0c1c2e" : "#ffffff"),
                              border: normalMaterials === "with" ? "1.5px solid #d7a928" : isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="radio"
                              name="normalMaterials"
                              checked={normalMaterials === "with"}
                              onChange={() => setNormalMaterials("with")}
                              style={{ marginTop: "3px" }}
                            />
                            <div>
                              <strong style={{ fontSize: "0.85rem", display: "block", color: isDark ? "#ffffff" : "#071727" }}>
                                With Materials
                              </strong>
                              <span style={{ fontSize: "0.76rem", color: "#2563eb", fontWeight: "700" }}>
                                30 QR / hour
                              </span>
                              <span style={{ fontSize: "0.72rem", color: isDark ? "#94a3b8" : "#64748b", display: "block" }}>
                                Min. 4 hrs = 120 QR total
                              </span>
                            </div>
                          </label>
                        </div>

                        {/* Hours & Staff Selectors */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                              Number of Hours
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="16"
                              value={normalHours}
                              onChange={(e) => setNormalHours(Math.max(1, parseInt(e.target.value) || 1))}
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                                background: isDark ? "#0c1c2e" : "#ffffff",
                                color: isDark ? "#ffffff" : "#0f172a",
                                fontSize: "0.88rem",
                                fontWeight: "700",
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                              Female Staff Count
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={normalStaff}
                              onChange={(e) => setNormalStaff(Math.max(1, parseInt(e.target.value) || 1))}
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                                background: isDark ? "#0c1c2e" : "#ffffff",
                                color: isDark ? "#ffffff" : "#0f172a",
                                fontSize: "0.88rem",
                                fontWeight: "700",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SERVICE DETAILS: DEEP CLEANING */}
                    {manualServiceType === "deep" && (
                      <div
                        style={{
                          background: isDark ? "#071320" : "#f8fafc",
                          borderRadius: "10px",
                          padding: "18px",
                          border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#475569", marginBottom: "14px", lineHeight: "1.5" }}>
                          <strong>Includes:</strong> 4 Male Staff Team with full tools & equipment: Moving furniture & cleaning behind/under, walls, corners, windows, kitchen, bathrooms, sofa, carpet, mattresses, curtains.
                        </div>

                        {/* Base Property Size Selector */}
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "8px", color: isDark ? "#ffffff" : "#071727" }}>
                          Property Size / Base Package:
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginBottom: "16px" }}>
                          {[
                            { key: "1_bhk", label: "1 BHK", rate: "300 QR (Standard)" },
                            { key: "studio", label: "Studio", rate: "250 QR" },
                            { key: "2_bhk", label: "2 BHK", rate: "450 QR" },
                            { key: "3_bhk", label: "3 BHK", rate: "600 QR" },
                            { key: "villa", label: "Villa", rate: "900 QR" },
                          ].map((p) => (
                            <button
                              key={p.key}
                              type="button"
                              onClick={() => setDeepPropertyType(p.key)}
                              style={{
                                padding: "10px 8px",
                                borderRadius: "8px",
                                border: deepPropertyType === p.key ? "2px solid #d7a928" : isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                                background: deepPropertyType === p.key ? (isDark ? "rgba(215, 169, 40, 0.2)" : "#fefce8") : (isDark ? "#0c1c2e" : "#ffffff"),
                                color: isDark ? "#ffffff" : "#071727",
                                cursor: "pointer",
                                textAlign: "center",
                              }}
                            >
                              <strong style={{ display: "block", fontSize: "0.88rem" }}>{p.label}</strong>
                              <span style={{ fontSize: "0.75rem", color: deepPropertyType === p.key ? "#d7a928" : "#16a34a", fontWeight: "700" }}>
                                {p.rate}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Add-on Services: Sofa, Carpet, Extras */}
                        <div style={{ borderTop: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0", paddingTop: "14px", marginTop: "14px" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: isDark ? "#ffffff" : "#071727", display: "block", marginBottom: "10px" }}>
                            Additional Specialty Add-ons:
                          </span>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                            {/* Sofa: 30 QR per seat */}
                            <div
                              style={{
                                padding: "12px",
                                background: isDark ? "#0c1c2e" : "#ffffff",
                                borderRadius: "8px",
                                border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                <label style={{ fontSize: "0.82rem", fontWeight: "700", color: isDark ? "#cbd5e1" : "#334155" }}>
                                  🛋️ Sofa Cleaning
                                </label>
                                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: "700" }}>
                                  30 QR / seat
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  placeholder="Seats (e.g. 5)"
                                  value={deepSofaSeats || ""}
                                  onChange={(e) => setDeepSofaSeats(Math.max(0, parseInt(e.target.value) || 0))}
                                  style={{
                                    width: "100%",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                                    background: isDark ? "#071320" : "#f8fafc",
                                    color: isDark ? "#ffffff" : "#0f172a",
                                    fontSize: "0.85rem",
                                  }}
                                />
                                {deepSofaSeats > 0 && (
                                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#d7a928", whiteSpace: "nowrap" }}>
                                    +{deepSofaSeats * 30} QR
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Carpet: 10 QR per m2 */}
                            <div
                              style={{
                                padding: "12px",
                                background: isDark ? "#0c1c2e" : "#ffffff",
                                borderRadius: "8px",
                                border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                <label style={{ fontSize: "0.82rem", fontWeight: "700", color: isDark ? "#cbd5e1" : "#334155" }}>
                                  🧶 Carpet Cleaning
                                </label>
                                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: "700" }}>
                                  10 QR / m²
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input
                                  type="number"
                                  min="0"
                                  max="500"
                                  placeholder="m² (e.g. 15)"
                                  value={deepCarpetArea || ""}
                                  onChange={(e) => setDeepCarpetArea(Math.max(0, parseInt(e.target.value) || 0))}
                                  style={{
                                    width: "100%",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                                    background: isDark ? "#071320" : "#f8fafc",
                                    color: isDark ? "#ffffff" : "#0f172a",
                                    fontSize: "0.85rem",
                                  }}
                                />
                                {deepCarpetArea > 0 && (
                                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#d7a928", whiteSpace: "nowrap" }}>
                                    +{deepCarpetArea * 10} QR
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Extra Item (Mattress, Curtains, etc.) */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "2fr 1fr",
                              gap: "8px",
                              padding: "10px",
                              background: isDark ? "#0c1c2e" : "#ffffff",
                              borderRadius: "8px",
                              border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Extra Item (e.g. Mattress / Curtains)"
                              value={deepExtraName}
                              onChange={(e) => setDeepExtraName(e.target.value)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                                background: isDark ? "#071320" : "#f8fafc",
                                color: isDark ? "#ffffff" : "#0f172a",
                                fontSize: "0.82rem",
                              }}
                            />
                            <input
                              type="number"
                              min="0"
                              placeholder="Price QR"
                              value={deepExtraPrice || ""}
                              onChange={(e) => setDeepExtraPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                                background: isDark ? "#071320" : "#f8fafc",
                                color: isDark ? "#ffffff" : "#0f172a",
                                fontSize: "0.82rem",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SERVICE DETAILS: CUSTOM CONTRACTING */}
                    {manualServiceType === "custom" && (
                      <div
                        style={{
                          background: isDark ? "#071320" : "#f8fafc",
                          borderRadius: "10px",
                          padding: "18px",
                          border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                            Specialized Service Description
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Commercial HVAC Overhaul / Façade Glass Polishing"
                            value={customServiceName}
                            onChange={(e) => setCustomServiceName(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                              background: isDark ? "#0c1c2e" : "#ffffff",
                              color: isDark ? "#ffffff" : "#0f172a",
                              fontSize: "0.88rem",
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                            Contract Base Amount (QAR)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Amount in QAR"
                            value={customServiceAmount}
                            onChange={(e) => setCustomServiceAmount(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                              background: isDark ? "#0c1c2e" : "#ffffff",
                              color: isDark ? "#ffffff" : "#0f172a",
                              fontSize: "0.88rem",
                              fontWeight: "700",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CARD 2: Location, Transport & Booking Details */}
                  <div
                    style={{
                      background: isDark ? "#0c1c2e" : "#ffffff",
                      borderRadius: "14px",
                      padding: "24px",
                      border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <MapPin size={18} color="#d7a928" />
                      <h3 style={{ margin: 0, fontSize: "1.1rem", color: isDark ? "#ffffff" : "#071727" }}>
                        2. Location & Booking Confirmation Details
                      </h3>
                    </div>

                    {/* Transport Location Selector */}
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "8px", color: isDark ? "#ffffff" : "#071727" }}>
                      🚗 Transport & Area Zone:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                      <button
                        type="button"
                        onClick={() => setEntryTransportType("inside")}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: entryTransportType === "inside" ? "2px solid #16a34a" : isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                          background: entryTransportType === "inside" ? "rgba(22, 163, 74, 0.15)" : (isDark ? "#071320" : "#f8fafc"),
                          color: isDark ? "#ffffff" : "#071727",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <strong style={{ display: "block", fontSize: "0.85rem" }}>Inside Doha</strong>
                        <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: "700" }}>
                          Free Transport (0 QR)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEntryTransportType("outside")}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: entryTransportType === "outside" ? "2px solid #d7a928" : isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                          background: entryTransportType === "outside" ? "rgba(215, 169, 40, 0.15)" : (isDark ? "#071320" : "#f8fafc"),
                          color: isDark ? "#ffffff" : "#071727",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <strong style={{ display: "block", fontSize: "0.85rem" }}>Outside Doha</strong>
                        <span style={{ fontSize: "0.75rem", color: "#d7a928", fontWeight: "700" }}>
                          +15 to 30 QR Charge
                        </span>
                      </button>
                    </div>

                    {entryTransportType === "outside" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", padding: "10px 14px", background: "rgba(215, 169, 40, 0.1)", borderRadius: "8px", border: "1px solid rgba(215, 169, 40, 0.3)" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: "700", color: isDark ? "#f5d061" : "#92400e" }}>
                          Transport Fee:
                        </span>
                        {[15, 20, 25, 30].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setEntryTransportCharge(amt)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: entryTransportCharge === amt ? "2px solid #d7a928" : "1px solid #cbd5e1",
                              background: entryTransportCharge === amt ? "#d7a928" : isDark ? "#071320" : "#ffffff",
                              color: entryTransportCharge === amt ? "#071727" : isDark ? "#ffffff" : "#334155",
                              fontSize: "0.78rem",
                              fontWeight: "700",
                              cursor: "pointer",
                            }}
                          >
                            {amt} QR
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Booking Confirmation Format: Location, Bldg, Floor, Flat */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                          📍 Current Location / Area
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Al Sadd / Porto Arabia / Lusail"
                          value={entryLocation}
                          onChange={(e) => setEntryLocation(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                            background: isDark ? "#071320" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                          🏢 Building No.
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bldg 24"
                          value={entryBuildingNo}
                          onChange={(e) => setEntryBuildingNo(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                            background: isDark ? "#071320" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                          📶 Floor No.
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 4th Floor"
                          value={entryFloorNo}
                          onChange={(e) => setEntryFloorNo(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                            background: isDark ? "#071320" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                          🏠 Flat No.
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Flat 402"
                          value={entryFlatNo}
                          onChange={(e) => setEntryFlatNo(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                            background: isDark ? "#071320" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                          Blue Plate / Zone
                        </label>
                        <input
                          type="text"
                          placeholder="Zone 38, Street 840"
                          value={entryBluePlate}
                          onChange={(e) => setEntryBluePlate(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                            background: isDark ? "#071320" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                    </div>

                    {/* Client Name & Phone */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                          Client Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Fatima Al-Kuwari"
                          value={entryClientName}
                          onChange={(e) => setEntryClientName(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                            background: isDark ? "#071320" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                          Client Phone / WhatsApp
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. +974 5512 3456"
                          value={entryClientPhone}
                          onChange={(e) => setEntryClientPhone(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                            background: isDark ? "#071320" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.88rem",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: Discounts, Expenses & Payment Settlement */}
                  <div
                    style={{
                      background: isDark ? "#0c1c2e" : "#ffffff",
                      borderRadius: "14px",
                      padding: "24px",
                      border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <Tag size={18} color="#d7a928" />
                      <h3 style={{ margin: 0, fontSize: "1.1rem", color: isDark ? "#ffffff" : "#071727" }}>
                        3. Discount, Direct Expenses & Settlement
                      </h3>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                      {/* Optional Discount */}
                      <div
                        style={{
                          padding: "14px",
                          background: isDark ? "#071320" : "#fefce8",
                          borderRadius: "10px",
                          border: isDark ? "1px solid #2d2a14" : "1px solid #fef08a",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <label style={{ fontSize: "0.84rem", fontWeight: "700", color: "#92400e" }}>
                            Optional Admin Discount (QAR)
                          </label>
                          <span style={{ fontSize: "0.72rem", color: "#92400e" }}>Deducted from Total</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 20 QR"
                          value={entryDiscount || ""}
                          onChange={(e) => setEntryDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1.5px solid #d7a928",
                            background: isDark ? "#0c1c2e" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.95rem",
                            fontWeight: "700",
                          }}
                        />
                      </div>

                      {/* Direct Job Cost Expense */}
                      <div
                        style={{
                          padding: "14px",
                          background: isDark ? "#071320" : "#fff1f2",
                          borderRadius: "10px",
                          border: isDark ? "1px solid #381a1f" : "1px solid #fecdd3",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <label style={{ fontSize: "0.84rem", fontWeight: "700", color: "#9f1239" }}>
                            Direct Job Expense (QAR)
                          </label>
                          <span style={{ fontSize: "0.72rem", color: "#9f1239" }}>Crew wage / fuel / items</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 80 QR"
                          value={entryCostExpense || ""}
                          onChange={(e) => setEntryCostExpense(Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1.5px solid #f43f5e",
                            background: isDark ? "#0c1c2e" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.95rem",
                            fontWeight: "700",
                          }}
                        />
                      </div>
                    </div>

                    {/* Payment Method, Status & Date */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                          Payment Method
                        </label>
                        <select
                          value={entryPaymentMethod}
                          onChange={(e) => setEntryPaymentMethod(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                            background: isDark ? "#071320" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.82rem",
                          }}
                        >
                          <option value="Cash on Site (Offline)">Cash on Site (Offline)</option>
                          <option value="Company Cheque (Offline)">Company Cheque (Offline)</option>
                          <option value="Credit Card / QNB Online (Online)">Credit Card / QNB Gateway (Online)</option>
                          <option value="Corporate Bank Wire (Online)">Corporate Bank Wire (Online)</option>
                          <option value="POS Machine on Delivery (Offline)">POS Machine on Delivery (Offline)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                          Payment Status
                        </label>
                        <select
                          value={entryPaymentStatus}
                          onChange={(e) => setEntryPaymentStatus(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                            background: isDark ? "#071320" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.82rem",
                          }}
                        >
                          <option value="Completed">Completed (Paid)</option>
                          <option value="Pending">Pending (Receivable)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px", color: isDark ? "#cbd5e1" : "#334155" }}>
                          Work Status
                        </label>
                        <select
                          value={entryWorkStatus}
                          onChange={(e) => setEntryWorkStatus(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1",
                            background: isDark ? "#071320" : "#ffffff",
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: "0.82rem",
                          }}
                        >
                          <option value="Completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Live Calculation Invoice Summary & Submit Action */}
                <div style={{ position: "sticky", top: "20px" }}>
                  <div
                    style={{
                      background: isDark ? "#0c1c2e" : "#ffffff",
                      borderRadius: "16px",
                      padding: "26px",
                      border: "2px solid #d7a928",
                      boxShadow: "0 10px 25px -5px rgba(215, 169, 40, 0.15)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: "800", letterSpacing: "0.1em", color: "#d7a928", textTransform: "uppercase" }}>
                        ACCOUNTING LIVE INVOICE
                      </span>
                      <span
                        style={{
                          background: "#16a34a",
                          color: "#ffffff",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: "800",
                        }}
                      >
                        ● Auto-Calculated
                      </span>
                    </div>

                    {/* Calculated Figures */}
                    {(() => {
                      const calc = calculateManualEntry();
                      return (
                        <>
                          <div style={{ marginBottom: "18px", paddingBottom: "16px", borderBottom: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: "0.84rem", color: isDark ? "#94a3b8" : "#64748b", marginBottom: "4px" }}>
                              Total to Collect from Client:
                            </div>
                            <div style={{ fontSize: "2.4rem", fontWeight: "900", color: "#16a34a", lineHeight: "1.1" }}>
                              {formatQAR(calc.finalAmount)}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: isDark ? "#cbd5e1" : "#475569", marginTop: "4px" }}>
                              Net Profit: <strong style={{ color: "#d7a928" }}>{formatQAR(calc.netProfit)}</strong> ({calc.profitMargin}% margin)
                            </div>
                          </div>

                          {/* Line items table */}
                          <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: isDark ? "#cbd5e1" : "#475569" }}>Base Service:</span>
                              <strong>{formatQAR(calc.baseRate)}</strong>
                            </div>

                            {calc.addOns.map((ad, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#2563eb" }}>
                                <span>+ {ad.label}:</span>
                                <strong>+{formatQAR(ad.amount)}</strong>
                              </div>
                            ))}

                            {calc.transportAmt > 0 && (
                              <div style={{ display: "flex", justifyContent: "space-between", color: "#d97706" }}>
                                <span>+ Transport (Outside Doha):</span>
                                <strong>+{formatQAR(calc.transportAmt)}</strong>
                              </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: isDark ? "1px dashed #1e385b" : "1px dashed #cbd5e1", paddingTop: "6px" }}>
                              <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>Subtotal:</span>
                              <strong>{formatQAR(calc.grossSubtotal)}</strong>
                            </div>

                            {calc.discountAmt > 0 && (
                              <div style={{ display: "flex", justifyContent: "space-between", color: "#e11d48" }}>
                                <span>- Special Admin Discount:</span>
                                <strong style={{ color: "#e11d48" }}>-{formatQAR(calc.discountAmt)}</strong>
                              </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: isDark ? "1px solid #1e385b" : "1px solid #cbd5e1", paddingTop: "6px", fontSize: "0.95rem" }}>
                              <strong style={{ color: isDark ? "#ffffff" : "#071727" }}>Final Customer Price:</strong>
                              <strong style={{ color: "#16a34a" }}>{formatQAR(calc.finalAmount)}</strong>
                            </div>

                            {calc.directCost > 0 && (
                              <div style={{ display: "flex", justifyContent: "space-between", color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.78rem" }}>
                                <span>Direct Job Cost:</span>
                                <span>-{formatQAR(calc.directCost)}</span>
                              </div>
                            )}
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={submittingEntry}
                            className="button button-primary"
                            style={{
                              width: "100%",
                              padding: "14px",
                              fontSize: "1rem",
                              fontWeight: "800",
                              background: "#d7a928",
                              color: "#071727",
                              border: "none",
                              borderRadius: "10px",
                              cursor: submittingEntry ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              boxShadow: "0 4px 14px rgba(215, 169, 40, 0.4)",
                            }}
                          >
                            {submittingEntry ? (
                              <>
                                <RefreshCw size={18} className="animate-spin" />
                                <span>Saving to Database...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={18} />
                                <span>Complete Entry & Save to Database</span>
                              </>
                            )}
                          </button>

                          <div style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", textAlign: "center", marginTop: "12px", lineHeight: "1.4" }}>
                            Automatically updates Gross Inflow, Net Profit, Work Orders ledger, and generates instant WhatsApp share voucher.
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ACCOUNTING & FINANCE TAB */}
        {activeTab === "accounting" && (
          <div>
            {/* Header Action Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.4rem", margin: 0, color: isDark ? "#ffffff" : "#071727" }}>
                  Accounting & Payment Ledger
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Manage Online (Gateway/Wire/Card) and Offline (Cash/Cheque/POS) transactions, calculate profit & expenses in Qatari Riyal (QAR).
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("manual-entry")}
                  className="button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    fontSize: "0.9rem",
                    fontWeight: "800",
                    background: "#d7a928",
                    color: "#071727",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(215, 169, 40, 0.3)",
                  }}
                >
                  <Calculator size={18} />
                  <span>🧹 Manual Work Entry (Auto-Calc)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="button button-outline"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  <PlusCircle size={18} />
                  <span>Custom Voucher</span>
                </button>
              </div>
            </div>

            {/* Financial KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
                marginBottom: "26px",
              }}
            >
              {/* Gross Revenue */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "22px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                  GROSS REVENUE (COLLECTED)
                </div>
                <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "#16a34a", margin: "6px 0 4px" }}>
                  {formatQAR(totalGrossRevenue)}
                </div>
                <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                  From {payments.filter((p) => p.status === "Completed").length} verified receipts
                </div>
              </div>

              {/* Direct Expenses */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "22px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                  DIRECT EXPENSES & COSTS
                </div>
                <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "#e11d48", margin: "6px 0 4px" }}>
                  {formatQAR(totalDirectExpenses)}
                </div>
                <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Material, labor & equipment costs
                </div>
              </div>

              {/* Net Profit */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "22px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                  NET OPERATING PROFIT
                </div>
                <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "#d7a928", margin: "6px 0 4px" }}>
                  {formatQAR(netCompanyProfit)}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      fontSize: "0.74rem",
                      fontWeight: "700",
                    }}
                  >
                    {profitMarginPercent}% Profit Margin
                  </span>
                </div>
              </div>

              {/* Pending Receivables */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "22px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                  PENDING RECEIVABLES
                </div>
                <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "#d97706", margin: "6px 0 4px" }}>
                  {formatQAR(pendingRevenue)}
                </div>
                <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                  {payments.filter((p) => p.status === "Pending").length} invoices pending clearance
                </div>
              </div>
            </div>

            {/* Online vs Offline Comparison Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "20px",
                marginBottom: "26px",
              }}
            >
              {/* Online Card */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  borderRadius: "14px",
                  padding: "22px",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563eb", padding: "8px", borderRadius: "8px" }}>
                      <Globe size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.98rem", color: isDark ? "#ffffff" : "#071727" }}>
                        Online Payments (Digital Channels)
                      </h4>
                      <span style={{ fontSize: "0.76rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                        QNB Gateway, Credit/Debit Cards, Wire SWIFT
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#2563eb" }}>
                    {formatQAR(onlineRevenue)}
                  </span>
                </div>

                <div style={{ width: "100%", height: "8px", background: isDark ? "#142840" : "#e2e8f0", borderRadius: "999px", overflow: "hidden", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: `${totalGrossRevenue > 0 ? Math.min(100, (onlineRevenue / totalGrossRevenue) * 100) : 0}%`,
                      height: "100%",
                      background: "#2563eb",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                  <span>Volume: {onlineCount} transactions</span>
                  <span>Share: {totalGrossRevenue > 0 ? Math.round((onlineRevenue / totalGrossRevenue) * 100) : 0}% of revenue</span>
                </div>
              </div>

              {/* Offline Card */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  borderRadius: "14px",
                  padding: "22px",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ background: "rgba(215, 169, 40, 0.15)", color: "#d7a928", padding: "8px", borderRadius: "8px" }}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.98rem", color: isDark ? "#ffffff" : "#071727" }}>
                        Offline Payments (Physical Settlement)
                      </h4>
                      <span style={{ fontSize: "0.76rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                        Cash on Delivery, Certified Cheques, POS Terminal
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#d7a928" }}>
                    {formatQAR(offlineRevenue)}
                  </span>
                </div>

                <div style={{ width: "100%", height: "8px", background: isDark ? "#142840" : "#e2e8f0", borderRadius: "999px", overflow: "hidden", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: `${totalGrossRevenue > 0 ? Math.min(100, (offlineRevenue / totalGrossRevenue) * 100) : 0}%`,
                      height: "100%",
                      background: "#d7a928",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                  <span>Volume: {offlineCount} transactions</span>
                  <span>Share: {totalGrossRevenue > 0 ? Math.round((offlineRevenue / totalGrossRevenue) * 100) : 0}% of revenue</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
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
              {/* Type and Status Filters */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b" }}>Channel:</span>
                {["All", "Online", "Offline"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPaymentFilterType(type)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      border: "none",
                      background: paymentFilterType === type ? "#071727" : isDark ? "#0c1c2e" : "#ffffff",
                      color: paymentFilterType === type ? "#d7a928" : isDark ? "#94a3b8" : "#475569",
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    {type}
                  </button>
                ))}

                <span style={{ fontSize: "0.82rem", fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b", marginLeft: "10px" }}>Status:</span>
                {["All", "Completed", "Pending", "Cancelled"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPaymentFilterStatus(st)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      border: "none",
                      background: paymentFilterStatus === st ? "#071727" : isDark ? "#0c1c2e" : "#ffffff",
                      color: paymentFilterStatus === st ? "#d7a928" : isDark ? "#94a3b8" : "#475569",
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search Box */}
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
                  placeholder="Search invoice, client, gateway..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 36px",
                    borderRadius: "8px",
                    border: isDark ? "1.5px solid #1e385b" : "1.5px solid #cbd5e1",
                    background: isDark ? "#071320" : "#ffffff",
                    color: isDark ? "#ffffff" : "#0f172a",
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Payments Table */}
            <div
              style={{
                background: isDark ? "#0c1c2e" : "#ffffff",
                borderRadius: "14px",
                border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              {filteredPayments.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center", color: isDark ? "#94a3b8" : "#64748b" }}>
                  <CreditCard size={44} color="#d7a928" style={{ marginBottom: "14px", opacity: 0.8 }} />
                  <h4 style={{ margin: "0 0 8px", color: isDark ? "#ffffff" : "#0f172a", fontSize: "1.1rem", fontWeight: "700" }}>
                    {payments.length === 0 ? "No Payment Transactions Recorded Yet" : "No Payments Match Filters"}
                  </h4>
                  <p style={{ margin: "0 auto 20px", fontSize: "0.88rem", maxWidth: "480px" }}>
                    {payments.length === 0
                      ? "The accounting ledger is clean of fake data. Real-time gross inflow and profit will update live as you record manual payments or link payments from completed work orders."
                      : "Try adjusting your payment channel, status, or search query above."}
                  </p>
                  {payments.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      style={{
                        padding: "10px 22px",
                        borderRadius: "8px",
                        background: "#d7a928",
                        color: "#071727",
                        border: "none",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <PlusCircle size={16} />
                      <span>Record First Payment Voucher</span>
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr
                        style={{
                          background: isDark ? "#09131f" : "#f8fafc",
                          borderBottom: isDark ? "2px solid #1a3250" : "2px solid #e2e8f0",
                          color: isDark ? "#94a3b8" : "#64748b",
                          fontSize: "0.78rem",
                          letterSpacing: "0.04em",
                        }}
                      >
                        <th style={{ padding: "12px 14px" }}>INVOICE / REF</th>
                        <th style={{ padding: "12px 14px" }}>CLIENT & DESCRIPTION</th>
                        <th style={{ padding: "12px 14px" }}>CHANNEL</th>
                        <th style={{ padding: "12px 14px" }}>METHOD / GATEWAY</th>
                        <th style={{ padding: "12px 14px" }}>GROSS (QAR)</th>
                        <th style={{ padding: "12px 14px" }}>EXPENSE (QAR)</th>
                        <th style={{ padding: "12px 14px" }}>NET PROFIT</th>
                        <th style={{ padding: "12px 14px" }}>STATUS</th>
                        <th style={{ padding: "12px 14px", textAlign: "right" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((p) => {
                        const amt = Number(p.amount) || 0;
                        const exp = Number(p.cost_expense ?? p.costExpense ?? 0);
                        const net = amt - exp;
                        const pType = p.payment_type || p.paymentType || "Online";

                        return (
                          <tr
                            key={p.id || p.invoice_no || p.invoiceNo}
                            style={{
                              borderBottom: isDark ? "1px solid #142840" : "1px solid #f1f5f9",
                              fontSize: "0.87rem",
                            }}
                          >
                            <td style={{ padding: "14px", fontWeight: "700", color: "#d7a928" }}>
                              {p.invoice_no || p.invoiceNo}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <div style={{ fontWeight: "700", color: isDark ? "#ffffff" : "#0f172a" }}>
                                {p.client_name || p.clientName}
                              </div>
                              <div style={{ fontSize: "0.78rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                                {p.title}
                              </div>
                            </td>
                            <td style={{ padding: "14px" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  background: pType === "Online" ? "rgba(37, 99, 235, 0.12)" : "rgba(215, 169, 40, 0.15)",
                                  color: pType === "Online" ? "#2563eb" : "#d7a928",
                                }}
                              >
                                {pType}
                              </span>
                            </td>
                            <td style={{ padding: "14px", fontSize: "0.82rem", color: isDark ? "#cbd5e1" : "#334155" }}>
                              {p.gateway_method || p.gatewayMethod}
                            </td>
                            <td style={{ padding: "14px", fontWeight: "700", color: "#16a34a" }}>
                              {formatQAR(amt)}
                            </td>
                            <td style={{ padding: "14px", color: "#e11d48", fontWeight: "600" }}>
                              {formatQAR(exp)}
                            </td>
                            <td style={{ padding: "14px", fontWeight: "800", color: net >= 0 ? "#d7a928" : "#dc2626" }}>
                              {formatQAR(net)}
                            </td>
                            <td style={{ padding: "14px" }}>
                              {getStatusBadge(p.status)}
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
                                {/* Quick Status Toggle */}
                                <select
                                  value={p.status}
                                  onChange={(e) => handleUpdatePaymentStatus(p.id, e.target.value)}
                                  style={{
                                    padding: "5px 8px",
                                    fontSize: "0.75rem",
                                    borderRadius: "6px",
                                    border: isDark ? "1px solid #1a3250" : "1px solid #cbd5e1",
                                    background: isDark ? "#071320" : "#ffffff",
                                    color: isDark ? "#ffffff" : "#0f172a",
                                    cursor: "pointer",
                                  }}
                                >
                                  <option value="Completed">Completed</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>

                                {/* Print Receipt Button */}
                                <button
                                  type="button"
                                  onClick={() => setReceiptPayment(p)}
                                  title="Print Official Commercial Receipt"
                                  style={{
                                    padding: "6px",
                                    borderRadius: "6px",
                                    border: isDark ? "1px solid #1a3250" : "1px solid #cbd5e1",
                                    background: isDark ? "#071320" : "#ffffff",
                                    color: "#d7a928",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Printer size={15} />
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeletePayment(p.id)}
                                  title="Delete Transaction"
                                  style={{
                                    padding: "6px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "rgba(220, 38, 38, 0.12)",
                                    color: "#dc2626",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORK OPERATIONS TAB */}
        {activeTab === "works" && (
          <div>
            {/* Header Action Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.4rem", margin: 0, color: isDark ? "#ffffff" : "#071727" }}>
                  Contracting & Work Operations Tracker
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Monitor project fulfillment, track works that are Completed, Pending / In Progress, and Cancelled across Qatar.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("manual-entry")}
                  className="button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    fontSize: "0.9rem",
                    fontWeight: "800",
                    background: "#d7a928",
                    color: "#071727",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(215, 169, 40, 0.3)",
                  }}
                >
                  <Calculator size={18} />
                  <span>🧹 Manual Work Entry (Auto-Calc)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowWorkModal(true)}
                  className="button button-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  <PlusCircle size={18} />
                  <span>Add New Work Order</span>
                </button>
              </div>
            </div>

            {/* Work Operations KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "20px",
                marginBottom: "26px",
              }}
            >
              {/* Total Works */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "22px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                  TOTAL WORK CONTRACTS
                </div>
                <div style={{ fontSize: "1.85rem", fontWeight: "800", color: isDark ? "#ffffff" : "#071727", margin: "6px 0 4px" }}>
                  {totalWorksCount} Projects
                </div>
                <div style={{ fontSize: "0.8rem", color: "#d7a928", fontWeight: "700" }}>
                  Portfolio: {formatQAR(totalContractValue)}
                </div>
              </div>

              {/* Completed Works */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "22px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                  COMPLETED WORKS
                </div>
                <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "#16a34a", margin: "6px 0 4px" }}>
                  {completedWorksCount} Completed
                </div>
                <div style={{ fontSize: "0.8rem", color: "#166534", fontWeight: "700" }}>
                  {totalWorksCount > 0 ? Math.round((completedWorksCount / totalWorksCount) * 100) : 0}% Contract Delivery Rate
                </div>
              </div>

              {/* Pending / In Progress */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "22px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                  PENDING / IN PROGRESS
                </div>
                <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "#2563eb", margin: "6px 0 4px" }}>
                  {inProgressWorksCount + pendingWorksCount} Active
                </div>
                <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                  {inProgressWorksCount} On-site • {pendingWorksCount} Scheduled
                </div>
              </div>

              {/* Cancelled Works */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  padding: "22px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.04em" }}>
                  CANCELLED WORKS
                </div>
                <div style={{ fontSize: "1.85rem", fontWeight: "800", color: "#dc2626", margin: "6px 0 4px" }}>
                  {cancelledWorksCount} Cancelled
                </div>
                <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Terminated or voided agreements
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
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
              {/* Status Filter Tabs */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["All", "In Progress", "Completed", "Pending", "Cancelled"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setWorkFilterStatus(st)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: "6px",
                      fontSize: "0.84rem",
                      fontWeight: "700",
                      border: "none",
                      background: workFilterStatus === st ? "#071727" : isDark ? "#0c1c2e" : "#ffffff",
                      color: workFilterStatus === st ? "#d7a928" : isDark ? "#94a3b8" : "#475569",
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search Box */}
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
                  placeholder="Search work order, title, client, location..."
                  value={workSearch}
                  onChange={(e) => setWorkSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 36px",
                    borderRadius: "8px",
                    border: isDark ? "1.5px solid #1e385b" : "1.5px solid #cbd5e1",
                    background: isDark ? "#071320" : "#ffffff",
                    color: isDark ? "#ffffff" : "#0f172a",
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Work Orders Table */}
            <div
              style={{
                background: isDark ? "#0c1c2e" : "#ffffff",
                borderRadius: "14px",
                border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              {filteredWorks.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center", color: isDark ? "#94a3b8" : "#64748b" }}>
                  <Briefcase size={44} color="#0284c7" style={{ marginBottom: "14px", opacity: 0.8 }} />
                  <h4 style={{ margin: "0 0 8px", color: isDark ? "#ffffff" : "#0f172a", fontSize: "1.1rem", fontWeight: "700" }}>
                    {works.length === 0 ? "No Work Orders Registered Yet" : "No Work Orders Match Filter"}
                  </h4>
                  <p style={{ margin: "0 auto 20px", fontSize: "0.88rem", maxWidth: "480px" }}>
                    {works.length === 0
                      ? "All demo/mock work orders have been removed. Add actual projects here to track contract status (Pending, In Progress, Completed, Cancelled) and link payments."
                      : "Try adjusting your status filter or search criteria."}
                  </p>
                  {works.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setShowWorkModal(true)}
                      style={{
                        padding: "10px 22px",
                        borderRadius: "8px",
                        background: "#0284c7",
                        color: "#ffffff",
                        border: "none",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <PlusCircle size={16} />
                      <span>Register First Work Order</span>
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr
                        style={{
                          background: isDark ? "#09131f" : "#f8fafc",
                          borderBottom: isDark ? "2px solid #1a3250" : "2px solid #e2e8f0",
                          color: isDark ? "#94a3b8" : "#64748b",
                          fontSize: "0.78rem",
                          letterSpacing: "0.04em",
                        }}
                      >
                        <th style={{ padding: "12px 14px" }}>ORDER #</th>
                        <th style={{ padding: "12px 14px" }}>PROJECT TITLE & SCOPE</th>
                        <th style={{ padding: "12px 14px" }}>CLIENT & LOCATION</th>
                        <th style={{ padding: "12px 14px" }}>SERVICE CATEGORY</th>
                        <th style={{ padding: "12px 14px" }}>CONTRACT VALUE</th>
                        <th style={{ padding: "12px 14px" }}>PAYMENT</th>
                        <th style={{ padding: "12px 14px" }}>WORK STATUS</th>
                        <th style={{ padding: "12px 14px" }}>SCHEDULE</th>
                        <th style={{ padding: "12px 14px", textAlign: "right" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorks.map((w) => {
                        const val = Number(w.contract_value ?? w.contractValue ?? 0);
                        const paid = Number(w.paid_amount ?? w.paidAmount ?? 0);

                        return (
                          <tr
                            key={w.id || w.work_order_no || w.workOrderNo}
                            style={{
                              borderBottom: isDark ? "1px solid #142840" : "1px solid #f1f5f9",
                              fontSize: "0.87rem",
                            }}
                          >
                            <td style={{ padding: "14px", fontWeight: "700", color: "#d7a928" }}>
                              {w.work_order_no || w.workOrderNo}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <div style={{ fontWeight: "700", color: isDark ? "#ffffff" : "#0f172a" }}>
                                {w.title}
                              </div>
                              {w.notes && (
                                <div style={{ fontSize: "0.76rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "2px" }}>
                                  {w.notes}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <div style={{ fontWeight: "600", color: isDark ? "#ffffff" : "#0f172a" }}>
                                {w.client_name || w.clientName}
                              </div>
                              <div style={{ fontSize: "0.78rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                                {w.location}
                              </div>
                            </td>
                            <td style={{ padding: "14px", fontSize: "0.82rem" }}>
                              {w.service_category || w.serviceCategory}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <div style={{ fontWeight: "700", color: "#16a34a" }}>
                                {formatQAR(val)}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                                Paid: {formatQAR(paid)}
                              </div>
                            </td>
                            <td style={{ padding: "14px" }}>
                              {getStatusBadge(w.payment_status || w.paymentStatus)}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <select
                                value={w.status}
                                onChange={(e) => handleUpdateWorkStatus(w.id, e.target.value)}
                                style={{
                                  padding: "5px 10px",
                                  fontSize: "0.78rem",
                                  fontWeight: "700",
                                  borderRadius: "6px",
                                  border: isDark ? "1px solid #1a3250" : "1px solid #cbd5e1",
                                  background:
                                    w.status === "Completed"
                                      ? "#dcfce7"
                                      : w.status === "Cancelled"
                                      ? "#fee2e2"
                                      : w.status === "In Progress"
                                      ? "#dbeafe"
                                      : "#fef3c7",
                                  color:
                                    w.status === "Completed"
                                      ? "#166534"
                                      : w.status === "Cancelled"
                                      ? "#991b1b"
                                      : w.status === "In Progress"
                                      ? "#1e40af"
                                      : "#92400e",
                                  cursor: "pointer",
                                }}
                              >
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Pending">Pending</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td style={{ padding: "14px", fontSize: "0.78rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                              <div>Start: {w.start_date || w.startDate || "N/A"}</div>
                              <div>Target: {w.target_completion_date || w.targetCompletionDate || "N/A"}</div>
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = Number(w.contract_value ?? w.contractValue ?? 0);
                                    const paid = Number(w.paid_amount ?? w.paidAmount ?? 0);
                                    const balance = Math.max(0, val - paid);
                                    setNewPayment({
                                      title: w.title || "Contract Service Payment",
                                      clientName: w.client_name || w.clientName || "",
                                      amount: balance > 0 ? String(balance) : String(val),
                                      costExpense: "0",
                                      paymentType: "Online",
                                      gatewayMethod: "Credit Card (Visa/Mastercard)",
                                      status: "Completed",
                                      notes: `Linked to Work Order ${w.work_order_no || w.work_id || w.id}`,
                                    });
                                    setShowPaymentModal(true);
                                  }}
                                  title="Record Payment for this Work Order"
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid #16a34a",
                                    background: "rgba(22, 163, 74, 0.12)",
                                    color: "#16a34a",
                                    fontSize: "0.75rem",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <CreditCard size={14} />
                                  <span>Log Payment</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteWork(w.id)}
                                  title="Delete Work Order"
                                  style={{
                                    padding: "6px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "rgba(220, 38, 38, 0.12)",
                                    color: "#dc2626",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
              background: isDark ? "#0c1c2e" : "#ffffff",
              borderRadius: "12px",
              padding: "30px",
              border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <ShieldCheck size={28} color="#166534" />
              <h2 style={{ margin: 0, fontSize: "1.3rem", color: isDark ? "#ffffff" : "#071727" }}>
                API Server & Service Status
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
              <div style={{ padding: "18px", background: isDark ? "#071320" : "#f8fafc", borderRadius: "8px", border: isDark ? "1px solid #142840" : "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "600" }}>BACKEND STATUS</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#166534", marginTop: "4px" }}>
                  ● {healthInfo?.status === "ok" ? "Operational (Healthy)" : "Checking..."}
                </div>
                <div style={{ fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "4px" }}>
                  Endpoint: {healthInfo?.endpoint || (typeof window !== "undefined" ? window.location.origin + "/api" : "/api")}
                </div>
              </div>

              <div style={{ padding: "18px", background: isDark ? "#071320" : "#f8fafc", borderRadius: "8px", border: isDark ? "1px solid #142840" : "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "600" }}>DATABASE ENGINE</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: isDark ? "#ffffff" : "#071727", marginTop: "4px" }}>
                  {healthInfo?.database?.status || "Active"}
                </div>
                <div style={{ fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "4px" }}>
                  Engine: {healthInfo?.database?.engine || "MySQL / Server Database"}
                </div>
              </div>

              <div style={{ padding: "18px", background: isDark ? "#071320" : "#f8fafc", borderRadius: "8px", border: isDark ? "1px solid #142840" : "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "600" }}>SERVER UPTIME</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: isDark ? "#ffffff" : "#071727", marginTop: "4px" }}>
                  {healthInfo?.uptime || "Running"}
                </div>
                <div style={{ fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "4px" }}>
                  System: {healthInfo?.system || healthInfo?.engine || "GSC Doha API Service"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN ACCOUNT & SECURITY TAB */}
        {activeTab === "account" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
            {/* Left Column: Administrator Profile & Database Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Profile Overview Card */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  borderRadius: "14px",
                  padding: "26px",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #fce08b 0%, #d7a928 50%, #b8860b 100%)",
                      color: "#071727",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "900",
                      fontSize: "1.3rem",
                      boxShadow: "0 4px 14px rgba(215, 169, 40, 0.35)",
                      flexShrink: 0,
                    }}
                  >
                    GA
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", color: isDark ? "#ffffff" : "#071727" }}>
                      {adminUser?.name || pwdAdminName || "GSC Administrator"}
                    </h2>
                    <div style={{ fontSize: "0.85rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "3px" }}>
                      {adminUser?.email || "admin@gsc-qatar.com"}
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#166534",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: "800",
                        }}
                      >
                        Superadmin (Full Access)
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    padding: "16px",
                    background: isDark ? "#071320" : "#f8fafc",
                    borderRadius: "10px",
                    border: isDark ? "1px solid #142840" : "1px solid #e2e8f0",
                    fontSize: "0.84rem",
                  }}
                >
                  <div>
                    <div style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: "0.75rem", fontWeight: "700" }}>ORGANIZATION</div>
                    <div style={{ color: isDark ? "#e2e8f0" : "#0f172a", fontWeight: "600", marginTop: "2px" }}>GSC Contracting W.L.L.</div>
                  </div>
                  <div>
                    <div style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: "0.75rem", fontWeight: "700" }}>LOCATION</div>
                    <div style={{ color: isDark ? "#e2e8f0" : "#0f172a", fontWeight: "600", marginTop: "2px" }}>Doha, State of Qatar</div>
                  </div>
                  <div>
                    <div style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: "0.75rem", fontWeight: "700" }}>SESSION STATUS</div>
                    <div style={{ color: "#16a34a", fontWeight: "700", marginTop: "2px" }}>● Active JWT Token</div>
                  </div>
                  <div>
                    <div style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: "0.75rem", fontWeight: "700" }}>TIMEZONE</div>
                    <div style={{ color: isDark ? "#e2e8f0" : "#0f172a", fontWeight: "600", marginTop: "2px" }}>Arabia Standard (GMT+3)</div>
                  </div>
                </div>
              </div>

              {/* Database & Hosting Info Card */}
              <div
                style={{
                  background: isDark ? "#0c1c2e" : "#ffffff",
                  borderRadius: "14px",
                  padding: "26px",
                  border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Database size={22} color="#d7a928" />
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: isDark ? "#ffffff" : "#071727" }}>
                    Production Hosting & Database Details
                  </h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: isDark ? "#071320" : "#f8fafc",
                      borderRadius: "6px",
                    }}
                  >
                    <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>Live Domain</span>
                    <strong style={{ color: "#d7a928" }}>gscqa.loveslife.biz</strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: isDark ? "#071320" : "#f8fafc",
                      borderRadius: "6px",
                    }}
                  >
                    <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>MySQL Database Host</span>
                    <code style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>sql113.infinityfree.com</code>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: isDark ? "#071320" : "#f8fafc",
                      borderRadius: "6px",
                    }}
                  >
                    <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>Database Name</span>
                    <code style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>if0_43086816_gsc</code>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: isDark ? "#071320" : "#f8fafc",
                      borderRadius: "6px",
                    }}
                  >
                    <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>Database User</span>
                    <code style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>if0_43086816</code>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: isDark ? "#071320" : "#f8fafc",
                      borderRadius: "6px",
                    }}
                  >
                    <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>Installed Tables</span>
                    <span><code>gsc_users</code>, <code>gsc_quotes</code>, <code>gsc_contacts</code></span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: isDark ? "#071320" : "#f8fafc",
                      borderRadius: "6px",
                    }}
                  >
                    <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>Server Architecture</span>
                    <span style={{ color: isDark ? "#e2e8f0" : "#0f172a" }}>Apache 2.4 / PHP 8.2 (Linux)</span>
                  </div>
                </div>

                <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <a
                    href="/api/health"
                    target="_blank"
                    rel="noreferrer"
                    className="button button-outline"
                    style={{
                      fontSize: "0.8rem",
                      padding: "7px 12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Activity size={14} />
                    <span>Check API Health Endpoint</span>
                  </a>
                  <a
                    href="/api/setup.php"
                    target="_blank"
                    rel="noreferrer"
                    className="button button-outline"
                    style={{
                      fontSize: "0.8rem",
                      padding: "7px 12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <RefreshCw size={14} />
                    <span>Verify Database Setup</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Security & Change Password Form */}
            <div
              style={{
                background: isDark ? "#0c1c2e" : "#ffffff",
                borderRadius: "14px",
                padding: "26px",
                border: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <Key size={22} color="#d7a928" />
                  <h3 style={{ margin: 0, fontSize: "1.15rem", color: isDark ? "#ffffff" : "#071727" }}>
                    Security & Credentials Management
                  </h3>
                </div>
                <p style={{ fontSize: "0.85rem", color: isDark ? "#94a3b8" : "#64748b", margin: "0 0 20px" }}>
                  Update your administrator display name and password committed to the live MySQL database.
                </p>

                {/* Alerts */}
                {pwdSuccess && (
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "#dcfce7",
                      border: "1px solid #86efac",
                      borderRadius: "8px",
                      color: "#166534",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span>{pwdSuccess}</span>
                  </div>
                )}

                {pwdError && (
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: "8px",
                      color: "#991b1b",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ShieldAlert size={18} color="#dc2626" />
                    <span>{pwdError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  {/* Admin Display Name */}
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="pwd-admin-name"
                      style={{
                        display: "block",
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        color: isDark ? "#cbd5e1" : "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Administrator Full Name
                    </label>
                    <input
                      id="pwd-admin-name"
                      type="text"
                      value={pwdAdminName}
                      onChange={(e) => setPwdAdminName(e.target.value)}
                      placeholder="e.g. GSC System Administrator"
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: isDark ? "1.5px solid #1e385b" : "1.5px solid #cbd5e1",
                        background: isDark ? "#071320" : "#ffffff",
                        color: isDark ? "#ffffff" : "#0f172a",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Current Password */}
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="pwd-current"
                      style={{
                        display: "block",
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        color: isDark ? "#cbd5e1" : "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Current Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="pwd-current"
                        type={showCurrentPwd ? "text" : "password"}
                        value={pwdCurrent}
                        onChange={(e) => setPwdCurrent(e.target.value)}
                        placeholder="Enter existing password"
                        required
                        style={{
                          width: "100%",
                          padding: "10px 40px 10px 14px",
                          borderRadius: "8px",
                          border: isDark ? "1.5px solid #1e385b" : "1.5px solid #cbd5e1",
                          background: isDark ? "#071320" : "#ffffff",
                          color: isDark ? "#ffffff" : "#0f172a",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
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
                        {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      htmlFor="pwd-new"
                      style={{
                        display: "block",
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        color: isDark ? "#cbd5e1" : "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      New Password (Minimum 6 characters)
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="pwd-new"
                        type={showNewPwd ? "text" : "password"}
                        value={pwdNew}
                        onChange={(e) => setPwdNew(e.target.value)}
                        placeholder="Enter secure new password"
                        required
                        minLength={6}
                        style={{
                          width: "100%",
                          padding: "10px 40px 10px 14px",
                          borderRadius: "8px",
                          border: isDark ? "1.5px solid #1e385b" : "1.5px solid #cbd5e1",
                          background: isDark ? "#071320" : "#ffffff",
                          color: isDark ? "#ffffff" : "#0f172a",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
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
                        {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div style={{ marginBottom: "22px" }}>
                    <label
                      htmlFor="pwd-confirm"
                      style={{
                        display: "block",
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        color: isDark ? "#cbd5e1" : "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Confirm New Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="pwd-confirm"
                        type={showConfirmPwd ? "text" : "password"}
                        value={pwdConfirm}
                        onChange={(e) => setPwdConfirm(e.target.value)}
                        placeholder="Re-type new password"
                        required
                        minLength={6}
                        style={{
                          width: "100%",
                          padding: "10px 40px 10px 14px",
                          borderRadius: "8px",
                          border: isDark ? "1.5px solid #1e385b" : "1.5px solid #cbd5e1",
                          background: isDark ? "#071320" : "#ffffff",
                          color: isDark ? "#ffffff" : "#0f172a",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
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
                        {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={pwdLoading}
                    className="button button-primary"
                    style={{
                      width: "100%",
                      minHeight: "46px",
                      fontSize: "0.92rem",
                      fontWeight: "700",
                      cursor: pwdLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {pwdLoading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Updating Password in MySQL...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Security Hint */}
              <div
                style={{
                  marginTop: "24px",
                  padding: "12px 14px",
                  background: isDark ? "#071320" : "#f8fafc",
                  borderRadius: "8px",
                  border: isDark ? "1px dashed #1e385b" : "1px dashed #cbd5e1",
                  fontSize: "0.78rem",
                  color: isDark ? "#94a3b8" : "#64748b",
                  lineHeight: "1.5",
                }}
              >
                🔒 <strong>Database Protection:</strong> Passwords are encrypted with standard BCRYPT salts before being committed to table <code>gsc_users</code> on <code>sql113.infinityfree.com</code>.
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

      {/* RECORD PAYMENT / INVOICE MODAL */}
      {showPaymentModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
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
              maxWidth: "560px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
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
                  NEW VOUCHER
                </span>
                <h2 style={{ fontSize: "1.25rem", margin: "6px 0 0", color: "#071727" }}>
                  Record Payment Transaction
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePayment}>
              {/* Client Name */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Client / Enterprise Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Al Asmakh Tower / Qatar Gas LLC"
                  value={newPayment.clientName}
                  onChange={(e) => setNewPayment({ ...newPayment, clientName: e.target.value })}
                  required
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

              {/* Title / Description */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Payment Description / Service Scope *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Commercial Cleaning Contract - March"
                  value={newPayment.title}
                  onChange={(e) => setNewPayment({ ...newPayment, title: e.target.value })}
                  required
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

              {/* Amounts Grid: Gross & Cost */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Gross Amount (QAR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15000"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    required
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
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Direct Cost / Expense (QAR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 4500"
                    value={newPayment.costExpense}
                    onChange={(e) => setNewPayment({ ...newPayment, costExpense: e.target.value })}
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
              </div>

              {/* Net Profit Preview Banner */}
              <div
                style={{
                  padding: "10px 14px",
                  background: "#f0fdf4",
                  borderRadius: "6px",
                  border: "1px solid #bbf7d0",
                  marginBottom: "14px",
                  fontSize: "0.84rem",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#166534" }}>Calculated Net Company Profit:</span>
                <strong style={{ color: "#166534" }}>
                  {formatQAR((Number(newPayment.amount) || 0) - (Number(newPayment.costExpense) || 0))}
                </strong>
              </div>

              {/* Channel: Online vs Offline */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Payment Channel *
                  </label>
                  <select
                    value={newPayment.paymentType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setNewPayment({
                        ...newPayment,
                        paymentType: newType,
                        gatewayMethod:
                          newType === "Online"
                            ? "Credit Card (Visa/Mastercard)"
                            : "On-Site Cash / Cash on Delivery",
                      });
                    }}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value="Online">Online (Digital Gateway / Card / Wire)</option>
                    <option value="Offline">Offline (Cash / Cheque / POS Terminal)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Settlement Method *
                  </label>
                  <select
                    value={newPayment.gatewayMethod}
                    onChange={(e) => setNewPayment({ ...newPayment, gatewayMethod: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                    }}
                  >
                    {newPayment.paymentType === "Online" ? (
                      <>
                        <option value="Credit Card (Visa/Mastercard)">Credit Card (Visa/Mastercard)</option>
                        <option value="QNB Qatar National Bank Gateway">QNB Qatar Gateway</option>
                        <option value="Corporate Bank Wire / SWIFT">Corporate Bank Wire / SWIFT</option>
                        <option value="Debit Card (NAPS Qatar)">Debit Card (NAPS Qatar)</option>
                      </>
                    ) : (
                      <>
                        <option value="On-Site Cash / Cash on Delivery">On-Site Cash / Cash on Delivery</option>
                        <option value="Company Cheque (PDC/Certified)">Company Cheque (PDC/Certified)</option>
                        <option value="Point of Sale (POS Terminal)">Point of Sale (POS Terminal)</option>
                        <option value="Bank Deposit Slip">Direct Bank Deposit Slip</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Status & Notes */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Transaction Status *
                </label>
                <select
                  value={newPayment.status}
                  onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="Completed">Completed (Settled in Bank / Cash Received)</option>
                  <option value="Pending">Pending (Invoice Dispatched / Awaiting Funds)</option>
                  <option value="Cancelled">Cancelled (Refunded or Voided)</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Internal Commercial Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cleared via QNB corporate account, receipt dispatched to finance department."
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="button button-outline"
                  style={{ padding: "8px 16px", fontSize: "0.88rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="button button-primary"
                  style={{ padding: "8px 20px", fontSize: "0.88rem" }}
                >
                  {actionLoading ? "Recording..." : "Save Payment Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD WORK ORDER MODAL */}
      {showWorkModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
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
              maxWidth: "580px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
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
                  NEW WORK ORDER
                </span>
                <h2 style={{ fontSize: "1.25rem", margin: "6px 0 0", color: "#071727" }}>
                  Deploy Work Order / Project
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowWorkModal(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWork}>
              {/* Project Title */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Project Title & Scope *
                </label>
                <input
                  type="text"
                  placeholder="e.g. West Bay Residential Towers HVAC Overhaul"
                  value={newWork.title}
                  onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                  required
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

              {/* Client & Location */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Client Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Barwa Real Estate"
                    value={newWork.clientName}
                    onChange={(e) => setNewWork({ ...newWork, clientName: e.target.value })}
                    required
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
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Location in Qatar *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lusail Marina / Doha"
                    value={newWork.location}
                    onChange={(e) => setNewWork({ ...newWork, location: e.target.value })}
                    required
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
              </div>

              {/* Service Category */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Service Category *
                </label>
                <select
                  value={newWork.serviceCategory}
                  onChange={(e) => setNewWork({ ...newWork, serviceCategory: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="Deep Cleaning & Disinfection">Deep Cleaning & Disinfection</option>
                  <option value="Marble Crystallization & Polishing">Marble Crystallization & Polishing</option>
                  <option value="Post-Construction Handover Cleaning">Post-Construction Handover Cleaning</option>
                  <option value="HVAC Duct Cleaning & Maintenance">HVAC Duct Cleaning & Maintenance</option>
                  <option value="Commercial Pest Control">Commercial Pest Control</option>
                  <option value="Facade Glass & High-Rise Cleaning">Facade Glass & High-Rise Cleaning</option>
                  <option value="General Contracting & Facilities">General Contracting & Facilities</option>
                </select>
              </div>

              {/* Contract Value & Paid Amount */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Total Contract Value (QAR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 45000"
                    value={newWork.contractValue}
                    onChange={(e) => setNewWork({ ...newWork, contractValue: e.target.value })}
                    required
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
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Paid Amount (QAR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15000"
                    value={newWork.paidAmount}
                    onChange={(e) => setNewWork({ ...newWork, paidAmount: e.target.value })}
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
              </div>

              {/* Work Status & Payment Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Work Execution Status *
                  </label>
                  <select
                    value={newWork.status}
                    onChange={(e) => setNewWork({ ...newWork, status: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value="In Progress">In Progress (Field Crew On-Site)</option>
                    <option value="Completed">Completed (Client Handover Finished)</option>
                    <option value="Pending">Pending (Scheduled / Awaiting Site Access)</option>
                    <option value="Cancelled">Cancelled (Agreement Voided)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Payment Status *
                  </label>
                  <select
                    value={newWork.paymentStatus}
                    onChange={(e) => setNewWork({ ...newWork, paymentStatus: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value="Partial">Partial (Advance / Milestones Paid)</option>
                    <option value="Paid">Paid (100% Settled)</option>
                    <option value="Unpaid">Unpaid (Awaiting Invoicing)</option>
                  </select>
                </div>
              </div>

              {/* Start Date & Target Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Mobilization / Start Date
                  </label>
                  <input
                    type="date"
                    value={newWork.startDate}
                    onChange={(e) => setNewWork({ ...newWork, startDate: e.target.value })}
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
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={newWork.targetCompletionDate}
                    onChange={(e) => setNewWork({ ...newWork, targetCompletionDate: e.target.value })}
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
              </div>

              {/* Field Notes */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Operational Scope & Supervisor Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 10 specialized technicians assigned. Night shift access permit approved."
                  value={newWork.notes}
                  onChange={(e) => setNewWork({ ...newWork, notes: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowWorkModal(false)}
                  className="button button-outline"
                  style={{ padding: "8px 16px", fontSize: "0.88rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="button button-primary"
                  style={{ padding: "8px 20px", fontSize: "0.88rem" }}
                >
                  {actionLoading ? "Deploying..." : "Deploy Work Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL COMMERCIAL RECEIPT / INVOICE MODAL */}
      {receiptPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
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
              maxWidth: "640px",
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              padding: "32px",
              color: "#0f172a",
            }}
          >
            {/* Modal Actions Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #071727",
                paddingBottom: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#d7a928", letterSpacing: "0.1em" }}>
                  STATE OF QATAR • OFFICIAL VOUCHER
                </div>
                <h2 style={{ fontSize: "1.35rem", margin: "4px 0 0", color: "#071727", fontWeight: "800" }}>
                  Genting Services & Contracting W.L.L.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setReceiptPayment(null)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Receipt Body */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>VOUCHER REFERENCE</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#071727" }}>
                    {receiptPayment.invoice_no || receiptPayment.invoiceNo}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>DATE OF ISSUE</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#071727" }}>
                    {new Date(receiptPayment.created_at || Date.now()).toLocaleDateString("en-GB")}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  padding: "14px",
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "16px",
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <span style={{ color: "#64748b" }}>Received From:</span>
                  <div style={{ fontWeight: "700", color: "#071727" }}>
                    {receiptPayment.client_name || receiptPayment.clientName}
                  </div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Payment Channel:</span>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        background:
                          (receiptPayment.payment_type || receiptPayment.paymentType) === "Online"
                            ? "#eff6ff"
                            : "#fef3c7",
                        color:
                          (receiptPayment.payment_type || receiptPayment.paymentType) === "Online"
                            ? "#1d4ed8"
                            : "#92400e",
                      }}
                    >
                      {receiptPayment.payment_type || receiptPayment.paymentType}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Payment Gateway / Method:</span>
                  <div style={{ fontWeight: "600", color: "#071727" }}>
                    {receiptPayment.gateway_method || receiptPayment.gatewayMethod}
                  </div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Transaction Status:</span>
                  <div>{getStatusBadge(receiptPayment.status)}</div>
                </div>
              </div>

              {/* Service Description */}
              <div style={{ marginBottom: "16px" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700" }}>Scope of Work / Description:</span>
                <div
                  style={{
                    background: "#ffffff",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    marginTop: "4px",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  {receiptPayment.title}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "0.88rem" }}>
                  <span>Gross Invoiced Amount:</span>
                  <strong style={{ color: "#16a34a", fontSize: "1rem" }}>
                    {formatQAR(receiptPayment.amount)}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "0.88rem" }}>
                  <span style={{ color: "#64748b" }}>Direct Operating Expense Allocation:</span>
                  <span style={{ color: "#e11d48", fontWeight: "600" }}>
                    - {formatQAR(receiptPayment.cost_expense ?? receiptPayment.costExpense ?? 0)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#f8fafc", fontSize: "0.95rem" }}>
                  <strong style={{ color: "#071727" }}>Net Company Profit:</strong>
                  <strong style={{ color: "#d7a928", fontSize: "1.1rem" }}>
                    {formatQAR(
                      (Number(receiptPayment.amount) || 0) -
                        (Number(receiptPayment.cost_expense ?? receiptPayment.costExpense ?? 0))
                    )}
                  </strong>
                </div>
              </div>

              {/* Stamp & Verification */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  paddingTop: "10px",
                  borderTop: "1px dashed #cbd5e1",
                  fontSize: "0.78rem",
                  color: "#64748b",
                }}
              >
                <div>
                  <div>Commercial Registration: <strong>CR 129482</strong></div>
                  <div>Genting Services & Contracting W.L.L.</div>
                  <div>Doha, State of Qatar</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      border: "2px solid #16a34a",
                      color: "#16a34a",
                      borderRadius: "6px",
                      padding: "6px 14px",
                      fontWeight: "800",
                      letterSpacing: "0.08em",
                      transform: "rotate(-3deg)",
                      fontSize: "0.75rem",
                    }}
                  >
                    VERIFIED & RECORDED
                  </div>
                </div>
              </div>
            </div>

            {/* Print and Close Buttons */}
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={() => setReceiptPayment(null)}
                className="button button-outline"
                style={{ padding: "8px 18px", fontSize: "0.88rem" }}
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="button button-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 22px",
                  fontSize: "0.88rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                <Printer size={16} />
                <span>Print Official Receipt (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED WORK VOUCHER & WHATSAPP SHARE MODAL */}
      {completedVoucher && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(7, 17, 28, 0.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: isDark ? "#0c1c2e" : "#ffffff",
              borderRadius: "16px",
              maxWidth: "580px",
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
              border: "2px solid #d7a928",
              padding: "28px",
            }}
          >
            {/* Modal Header */}
            <div style={{ textAlign: "center", marginBottom: "18px", borderBottom: isDark ? "1px solid #1a3250" : "1px solid #e2e8f0", paddingBottom: "16px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "rgba(22, 163, 74, 0.15)",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                  border: "1px solid rgba(22, 163, 74, 0.3)",
                }}
              >
                <CheckCircle2 size={30} />
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: "1.35rem", color: isDark ? "#ffffff" : "#071727", fontWeight: "800" }}>
                Work Recorded & Saved to Database!
              </h3>
              <p style={{ margin: 0, fontSize: "0.84rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                Invoice No: <strong style={{ color: "#d7a928" }}>{completedVoucher.invoice_no}</strong> • Work Order: <strong>{completedVoucher.work_id}</strong>
              </p>
            </div>

            {/* Printable Receipt Paper Container */}
            <div
              style={{
                background: "#ffffff",
                color: "#0f172a",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
                fontSize: "0.84rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* Receipt Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #071727", paddingBottom: "12px", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontWeight: "900", fontSize: "1.05rem", color: "#071727" }}>
                    GENTING SERVICES & CONTRACTING W.L.L.
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Commercial Registration: CR 129482 • Doha, Qatar
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Tel: +974 7025 2552 • info@gsc-qatar.com
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ background: "#071727", color: "#d7a928", padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "800", display: "inline-block" }}>
                    OFFICIAL INVOICE
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                    Date: {completedVoucher.date}
                  </div>
                </div>
              </div>

              {/* Client & Address Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "#f8fafc", padding: "10px", borderRadius: "6px", marginBottom: "12px" }}>
                <div>
                  <span style={{ color: "#64748b", fontSize: "0.72rem" }}>CLIENT NAME:</span>
                  <div style={{ fontWeight: "700" }}>{completedVoucher.client_name}</div>
                  {entryClientPhone && <div style={{ fontSize: "0.75rem", color: "#475569" }}>Tel: {entryClientPhone}</div>}
                </div>
                <div>
                  <span style={{ color: "#64748b", fontSize: "0.72rem" }}>LOCATION & UNIT:</span>
                  <div style={{ fontWeight: "600", fontSize: "0.78rem" }}>{completedVoucher.location}</div>
                </div>
              </div>

              {/* Itemized Calculation Breakdown */}
              {completedVoucher.breakdown && (
                <div
                  style={{
                    whiteSpace: "pre-line",
                    fontSize: "0.78rem",
                    background: "#f1f5f9",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    marginBottom: "12px",
                    lineHeight: "1.5",
                    borderLeft: "3px solid #d7a928",
                  }}
                >
                  {completedVoucher.breakdown}
                </div>
              )}

              {/* Total Settlement Summary */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>Total Collected / Payable:</span>
                  <strong style={{ color: "#16a34a", fontSize: "1.3rem" }}>
                    {formatQAR(completedVoucher.amount)}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "#64748b" }}>
                  <span>Payment Method: <strong>{completedVoucher.payment_method || entryPaymentMethod}</strong></span>
                  <span>Payment Status: <strong style={{ color: "#16a34a" }}>{completedVoucher.payment_status || entryPaymentStatus}</strong></span>
                </div>
              </div>
            </div>

            {/* Action Buttons: WhatsApp, Print, Done */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={() => handleCopyWhatsApp(completedVoucher)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  background: copiedWhatsApp ? "#16a34a" : "#25d366",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
                }}
              >
                <Copy size={16} />
                <span>{copiedWhatsApp ? "✓ Copied! Paste into Client WhatsApp Chat" : "📱 Copy WhatsApp Booking Message"}</span>
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="button button-outline"
                  style={{
                    padding: "10px",
                    fontSize: "0.88rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Printer size={16} />
                  <span>Print Receipt (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCompletedVoucher(null);
                    setEntryClientName("");
                    setEntryClientPhone("");
                    setEntryBuildingNo("");
                    setEntryFloorNo("");
                    setEntryFlatNo("");
                    setDeepSofaSeats(0);
                    setDeepCarpetArea(0);
                    setEntryDiscount(0);
                    setEntryCostExpense(0);
                  }}
                  className="button button-primary"
                  style={{
                    padding: "10px",
                    fontSize: "0.88rem",
                    fontWeight: "700",
                  }}
                >
                  Done / Record Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminPortal;
