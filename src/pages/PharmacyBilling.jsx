import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import Modal from "../components/Common/Modal";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  FileText,
  Check,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Printer,
  X
} from "lucide-react";
import "../styles/pharmacy.css";

const PharmacyBilling = () => {
  const {
    patients,
    medicines,
    bills,
    updateMedicineStock,
    addBill,
    payBill,
    theme
  } = useContext(AppContext);

  const { currentUser } = useContext(AuthContext);
  const toast = useToast();

  // --- State for Inventory ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // --- State for Invoice Builder ---
  const [invoicePatientId, setInvoicePatientId] = useState("");
  const [consultFee, setConsultFee] = useState(100);
  const [invoiceItems, setInvoiceItems] = useState([
    { medId: "", qty: 1 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  // --- Invoice Print Preview ---
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // --- Categories list ---
  const categories = ["All", ...new Set(medicines.map((m) => m.category))];

  // --- Handlers for Stock Management ---
  const handleStockIncrement = (medId, currentStock) => {
    const actor = currentUser?.name || "Pharmacist";
    const role = currentUser?.role || "receptionist";
    updateMedicineStock(medId, currentStock + 1, actor, role);
    toast.show("Stock increased by 1 unit", "info");
  };

  const handleStockDecrement = (medId, currentStock) => {
    if (currentStock <= 0) return;
    const actor = currentUser?.name || "Pharmacist";
    const role = currentUser?.role || "receptionist";
    updateMedicineStock(medId, currentStock - 1, actor, role);
    toast.show("Stock decreased by 1 unit", "info");
  };

  const handleStockDirectInput = (medId, value) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    const actor = currentUser?.name || "Pharmacist";
    const role = currentUser?.role || "receptionist";
    updateMedicineStock(medId, num, actor, role);
  };

  // --- Handlers for Invoice Builder ---
  const handleAddInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { medId: "", qty: 1 }]);
  };

  const handleRemoveInvoiceItem = (index) => {
    const list = [...invoiceItems];
    list.splice(index, 1);
    setInvoiceItems(list.length ? list : [{ medId: "", qty: 1 }]);
  };

  const handleInvoiceItemChange = (index, field, value) => {
    const updated = [...invoiceItems];
    if (field === "qty") {
      const q = parseInt(value, 10);
      updated[index][field] = isNaN(q) ? 1 : Math.max(1, q);
    } else {
      updated[index][field] = value;
    }
    setInvoiceItems(updated);
  };

  // Calculate totals for currently building invoice
  const calculateDraftTotals = () => {
    let medicineSubtotal = 0;
    const itemsList = [];

    invoiceItems.forEach((item) => {
      if (item.medId) {
        const med = medicines.find((m) => m.id === item.medId);
        if (med) {
          const itemTotal = med.price * item.qty;
          medicineSubtotal += itemTotal;
          itemsList.push({
            desc: `${med.name} (Qty x${item.qty})`,
            price: parseFloat(itemTotal.toFixed(2))
          });
        }
      }
    });

    const consult = parseFloat(consultFee) || 0;
    const subtotal = medicineSubtotal + consult;
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const grandTotal = parseFloat((subtotal + tax).toFixed(2));

    return {
      itemsList,
      consult,
      medicineSubtotal,
      subtotal,
      tax,
      grandTotal
    };
  };

  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!invoicePatientId) {
      toast.show("Please select a patient first.", "danger");
      return;
    }

    const patient = patients.find((p) => p.id === invoicePatientId);
    if (!patient) {
      toast.show("Invalid patient selected.", "danger");
      return;
    }

    // Check stock availability
    let stockValid = true;
    invoiceItems.forEach((item) => {
      if (item.medId) {
        const med = medicines.find((m) => m.id === item.medId);
        if (med && med.stock < item.qty) {
          toast.show(`Insufficient stock for ${med.name}. Available: ${med.stock}`, "danger");
          stockValid = false;
        }
      }
    });

    if (!stockValid) return;

    const { itemsList, consult, grandTotal } = calculateDraftTotals();
    const finalItems = [{ desc: "Professional Consultation Fee", price: consult }, ...itemsList];

    const actor = currentUser?.name || "Pharmacist";
    const role = currentUser?.role || "receptionist";

    const newBill = addBill(
      {
        patientId: patient.id,
        patientName: patient.name,
        items: finalItems,
        total: grandTotal,
        status: "Pending",
        paymentMethod
      },
      actor,
      role
    );

    toast.show(`Invoice #${newBill.id} generated successfully!`, "success");

    // Reset Invoice Builder Form
    setInvoicePatientId("");
    setConsultFee(100);
    setInvoiceItems([{ medId: "", qty: 1 }]);

    // Trigger Print Modal Immediately for evaluation
    setSelectedInvoice(newBill);
    setIsPrintModalOpen(true);
  };

  const handleMarkAsPaid = (billId) => {
    const actor = currentUser?.name || "Pharmacist";
    const role = currentUser?.role || "receptionist";
    payBill(billId, actor, role);
    toast.show(`Invoice #${billId} successfully paid!`, "success");
    
    // Update active modal if open
    if (selectedInvoice && selectedInvoice.id === billId) {
      setSelectedInvoice((prev) => ({ ...prev, status: "Paid" }));
    }
  };

  const openReceiptModal = (bill) => {
    setSelectedInvoice(bill);
    setIsPrintModalOpen(true);
  };

  // --- Filtering Inventory ---
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- Analytical Computations for CSS Charts ---
  const totalRevenue = bills
    .filter((b) => b.status === "Paid")
    .reduce((sum, b) => sum + b.total, 0);

  const pendingRevenue = bills
    .filter((b) => b.status === "Pending")
    .reduce((sum, b) => sum + b.total, 0);

  const lowStockMeds = medicines.filter((m) => m.stock <= m.threshold).length;
  const criticalMeds = medicines.filter((m) => m.stock === 0).length;

  const { subtotal: draftSubtotal, tax: draftTax, grandTotal: draftGrandTotal } = calculateDraftTotals();

  // Print simulation trigger
  const handlePrintTrigger = () => {
    toast.show("Preparing document for print spooler...", "success");
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  return (
    <div className="pharmacy-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Pharmacy & Billing</h1>
          <p>Manage pharmaceutical stocks, clinical supplies, and issue smart patient invoices.</p>
        </div>
      </div>

      {/* Analytics Overviews */}
      <div className="pharmacy-metrics">
        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper revenue">
            <DollarSign size={24} />
          </div>
          <div className="metric-info">
            <h3>Settled Revenue</h3>
            <div className="metric-value">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper pending">
            <TrendingUp size={24} />
          </div>
          <div className="metric-info">
            <h3>Outstanding Balances</h3>
            <div className="metric-value">${pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper stock">
            <AlertTriangle size={24} />
          </div>
          <div className="metric-info">
            <h3>Supply stock warnings</h3>
            <div className="metric-value">
              {lowStockMeds} <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "var(--text-secondary)" }}>low / {criticalMeds} empty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="billing-chart-panel">
        <div className="glass-card">
          <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Billing Settlement Health</h3>
          <div className="pure-css-bar-chart">
            <div className="chart-bar-container">
              <div
                className="chart-bar"
                style={{
                  height: `${(totalRevenue / (totalRevenue + pendingRevenue || 1)) * 100}%`,
                  backgroundColor: "var(--success-color)",
                  boxShadow: "0 0 10px rgba(16, 185, 129, 0.2)"
                }}
              >
                <div className="chart-bar-value">${Math.round(totalRevenue)}</div>
              </div>
              <div className="chart-bar-label">Collected</div>
            </div>
            <div className="chart-bar-container">
              <div
                className="chart-bar"
                style={{
                  height: `${(pendingRevenue / (totalRevenue + pendingRevenue || 1)) * 100}%`,
                  backgroundColor: "var(--warning-color)",
                  boxShadow: "0 0 10px rgba(245, 158, 11, 0.2)"
                }}
              >
                <div className="chart-bar-value">${Math.round(pendingRevenue)}</div>
              </div>
              <div className="chart-bar-label">Outstanding</div>
            </div>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
            Settlement efficiency score: {Math.round((totalRevenue / (totalRevenue + pendingRevenue || 1)) * 100)}%
          </p>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Key Drug Supplies Stock Levels</h3>
          <div className="pure-css-bar-chart">
            {medicines.slice(0, 5).map((med) => {
              const stockRatio = Math.min(100, (med.stock / 150) * 100);
              const color = med.stock <= med.threshold ? "var(--warning-color)" : "var(--primary-color)";
              return (
                <div className="chart-bar-container" key={med.id}>
                  <div
                    className="chart-bar"
                    style={{
                      height: `${stockRatio}%`,
                      backgroundColor: med.stock <= med.threshold ? "var(--warning-color)" : "var(--primary-color)"
                    }}
                  >
                    <div className="chart-bar-value">{med.stock}</div>
                  </div>
                  <div className="chart-bar-label" title={med.name}>
                    {med.name.split(" ")[0]}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
            Maximum graph reference represents 150 units inventory fill level.
          </p>
        </div>
      </div>

      {/* Main Action Workspaces */}
      <div className="pharmacy-main-grid">
        {/* Left Hand: Pharmacy Inventory */}
        <div className="glass-card">
          <div className="inventory-header">
            <h3 style={{ fontSize: "1.1rem" }}>Medicine & Supply Inventory</h3>
            <div className="inventory-actions">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search medications or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Drug / Category</th>
                  <th>Unit Price</th>
                  <th>Stock Levels</th>
                  <th>Status</th>
                  {currentUser?.role !== "patient" && <th style={{ textAlign: "center" }}>Quick Stock Edit</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((med) => {
                  const isLow = med.stock <= med.threshold;
                  const isOut = med.stock === 0;
                  
                  let statusClass = "active";
                  let statusText = "In Stock";
                  
                  if (isOut) {
                    statusClass = "critical";
                    statusText = "Out of Stock";
                  } else if (isLow) {
                    statusClass = "low";
                    statusText = "Low Stock";
                  }

                  return (
                    <tr key={med.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{med.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{med.category}</div>
                      </td>
                      <td>${med.price.toFixed(2)}</td>
                      <td>
                        <div className="stock-indicator">
                          <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>{med.stock} units</span>
                          <div className="stock-bar-bg">
                            <div
                              className="stock-bar-fill"
                              style={{
                                width: `${Math.min(100, (med.stock / 200) * 100)}%`,
                                backgroundColor: isOut ? "var(--danger-color)" : isLow ? "var(--warning-color)" : "var(--success-color)"
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>{statusText}</span>
                      </td>
                      {currentUser?.role !== "patient" && (
                        <td>
                          <div className="adjust-stock-btns" style={{ justifyContent: "center" }}>
                            <button
                              className="adjust-stock-btn"
                              onClick={() => handleStockDecrement(med.id, med.stock)}
                              disabled={med.stock <= 0}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="text"
                              className="adjust-stock-input"
                              value={med.stock}
                              onChange={(e) => handleStockDirectInput(med.id, e.target.value)}
                            />
                            <button
                              className="adjust-stock-btn"
                              onClick={() => handleStockIncrement(med.id, med.stock)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filteredMedicines.length === 0 && (
                  <tr>
                    <td colSpan={currentUser?.role !== "patient" ? 5 : 4} style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                      No medications matched your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Hand: Invoice Generator Form (Visible to Admin & Receptionist only) */}
        {currentUser?.role !== "patient" && currentUser?.role !== "doctor" ? (
          <div className="glass-card invoice-builder-card">
            <div className="invoice-builder-header">
              <h3 style={{ fontSize: "1.1rem" }}>Patient Billing Invoice Generator</h3>
              <FileText size={20} className="text-secondary" />
            </div>

            <form onSubmit={handleGenerateInvoice}>
              <div className="form-group">
                <label>Select Patient Intake Record</label>
                <select
                  className="form-control"
                  required
                  value={invoicePatientId}
                  onChange={(e) => setInvoicePatientId(e.target.value)}
                >
                  <option value="">-- Choose Admitted/Outpatient Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.status} - {p.room})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Professional / Consultation Fees ($)</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  required
                  value={consultFee}
                  onChange={(e) => setConsultFee(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "0.5rem" }}>
                <label>Prescribe & Charge Medications</label>
              </div>

              <div className="invoice-items-list">
                {invoiceItems.map((item, index) => {
                  const selectedMed = medicines.find((m) => m.id === item.medId);
                  return (
                    <div className="invoice-item-row" key={index}>
                      <select
                        className="invoice-item-select"
                        value={item.medId}
                        required
                        onChange={(e) => handleInvoiceItemChange(index, "medId", e.target.value)}
                      >
                        <option value="">Select Drug...</option>
                        {medicines.map((m) => (
                          <option key={m.id} value={m.id} disabled={m.stock <= 0}>
                            {m.name} (${m.price.toFixed(2)} - {m.stock} left)
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        className="invoice-item-qty"
                        min="1"
                        placeholder="Qty"
                        required
                        value={item.qty}
                        onChange={(e) => handleInvoiceItemChange(index, "qty", e.target.value)}
                      />

                      <div className="invoice-item-price">
                        {selectedMed ? `$${(selectedMed.price * item.qty).toFixed(2)}` : "$0.00"}
                      </div>

                      <button
                        type="button"
                        className="delete-item-btn"
                        onClick={() => handleRemoveInvoiceItem(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="add-item-trigger-btn"
                onClick={handleAddInvoiceItem}
              >
                <Plus size={14} /> Add Medicine Charged Row
              </button>

              <div className="form-group">
                <label>Payment Settlement Mode</label>
                <select
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Insurance Claim">Insurance Claim</option>
                  <option value="Cash / Cheque">Cash / Cheque</option>
                  <option value="Bank Wire">Bank Wire</option>
                </select>
              </div>

              <div className="billing-breakdown">
                <div className="breakdown-row">
                  <span>Fees Subtotal:</span>
                  <span>${draftSubtotal.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                  <span>State Healthcare Tax (8%):</span>
                  <span>${draftTax.toFixed(2)}</span>
                </div>
                <div className="breakdown-row total">
                  <span>Total Gross Due:</span>
                  <span>${draftGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Generate Billing Statement & Print
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "3rem", textAlign: "center" }}>
            <FileText size={48} style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }} />
            <h3>Intake Invoice Builder Locked</h3>
            <p style={{ color: "var(--text-secondary)", maxWidth: "320px", marginTop: "0.5rem" }}>
              Medical billing generation rights are restricted to Admin and Receptionist staff roles only.
            </p>
          </div>
        )}
      </div>

      {/* Lower Workspace: Recent Invoices Issued in the System */}
      <div className="glass-card recent-invoices-card">
        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Recent Hospital Statements & Bills Issued</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Patient Name</th>
                <th>Issued Date</th>
                <th>Total Charges</th>
                <th>Settlement</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => {
                const isPaid = bill.status === "Paid";
                return (
                  <tr key={bill.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{bill.id}</td>
                    <td>{bill.patientName}</td>
                    <td>{bill.date}</td>
                    <td style={{ fontWeight: 600 }}>${bill.total.toFixed(2)}</td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{bill.paymentMethod}</td>
                    <td>
                      <span className={`status-pill ${isPaid ? "paid" : "pending"}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="invoice-actions-cell" style={{ justifyContent: "flex-end" }}>
                        {!isPaid && currentUser?.role !== "patient" && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", borderColor: "var(--success-color)", color: "var(--success-color)" }}
                            onClick={() => handleMarkAsPaid(bill.id)}
                          >
                            <Check size={12} /> Pay
                          </button>
                        )}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                          onClick={() => openReceiptModal(bill)}
                        >
                          <Printer size={12} /> View Statement
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Document Modal Backdrop */}
      {isPrintModalOpen && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setIsPrintModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsPrintModalOpen(false)}>
              <X size={18} />
            </button>
            
            <div className="invoice-print-container">
              <div className="invoice-print-header">
                <div className="invoice-print-logo">
                  <h2>MEDVITALS HOSPITAL</h2>
                  <p>Smart Medical Care & Surgery Center</p>
                  <p>100 Clinical Parkway, Metro Heights</p>
                </div>
                <div className="invoice-print-meta">
                  <h3>BILL STATEMENT</h3>
                  <p>Invoice #: <span>{selectedInvoice.id}</span></p>
                  <p>Date: <span>{selectedInvoice.date}</span></p>
                  <p>Status: <span style={{ color: selectedInvoice.status === "Paid" ? "#10b981" : "#f59e0b" }}>{selectedInvoice.status.toUpperCase()}</span></p>
                </div>
              </div>

              <div className="invoice-print-details">
                <div>
                  <h4>Billed To:</h4>
                  <p style={{ fontWeight: "bold" }}>{selectedInvoice.patientName}</p>
                  <p>Patient Account ID: {selectedInvoice.patientId}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h4>Settlement Info:</h4>
                  <p>Method: <span>{selectedInvoice.paymentMethod}</span></p>
                  <p>Transaction ID: TXN-{selectedInvoice.id}</p>
                </div>
              </div>

              <table className="invoice-print-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ textAlign: "right" }}>Charged Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.desc}</td>
                      <td style={{ textAlign: "right" }}>${item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-print-summary">
                <div>
                  <span>Subtotal:</span>
                  <span>${(selectedInvoice.total / 1.08).toFixed(2)}</span>
                </div>
                <div>
                  <span>Tax (8%):</span>
                  <span>{(selectedInvoice.total - selectedInvoice.total / 1.08).toFixed(2)}</span>
                </div>
                <div className="print-total">
                  <span>Grand Total Paid:</span>
                  <span>${selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="invoice-print-footer">
                <p>Thank you for choosing MedVitals Healthcare.</p>
                <p>For billing queries, contact support@medvitals.com or dial +1 (555) 010-BILL.</p>
              </div>
            </div>

            <div className="invoice-modal-actions">
              {selectedInvoice.status !== "Paid" && currentUser?.role !== "patient" && (
                <button
                  className="btn btn-primary"
                  style={{ background: "var(--success-color)" }}
                  onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                >
                  <Check size={16} /> Mark Statement Paid
                </button>
              )}
              <button className="btn btn-primary" onClick={handlePrintTrigger}>
                <Printer size={16} /> Spool Print Receipt
              </button>
              <button className="btn btn-secondary" onClick={() => setIsPrintModalOpen(false)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyBilling;
