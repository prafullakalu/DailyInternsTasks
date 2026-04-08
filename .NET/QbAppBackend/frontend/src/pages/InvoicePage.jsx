import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Modal } from "../components/Modal";
import { RecordsTable } from "../components/RecordsTable";
import { formatCurrency, formatDate } from "../utils";

function emptyInvoice() {
  return {
    id: null,
    customerId: "",
    customerName: "",
    txnDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    taxAmount: 0,
    lines: [{ itemId: "", description: "", quantity: 1, unitPrice: 0 }]
  };
}

export function InvoicePage() {
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoice());
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [connections, setConnections] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function loadData() {
    try {
      setError("");
      const connectionsResponse = await api.get("/qb/connections");
      setConnections(connectionsResponse);

      if (connectionsResponse.length === 0) {
        setCustomers([]);
        setItems([]);
        setInvoices([]);
        return;
      }

      const [customersResponse, itemsResponse, invoicesResponse] = await Promise.all([
        api.get("/qb/customers"),
        api.get("/qb/items"),
        api.get("/invoices")
      ]);
      setCustomers(customersResponse);
      setItems(itemsResponse);
      setInvoices(invoicesResponse);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const total = useMemo(
    () => invoiceForm.lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0) + Number(invoiceForm.taxAmount || 0),
    [invoiceForm.lines, invoiceForm.taxAmount]
  );

  const filteredInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return invoices;
    }

    return invoices.filter((invoice) => JSON.stringify(invoice).toLowerCase().includes(term));
  }, [invoices, search]);

  const totalInvoiced = useMemo(
    () => invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0),
    [invoices]
  );

  const openInvoices = useMemo(
    () => invoices.filter((invoice) => (invoice.status || "").toLowerCase() !== "paid").length,
    [invoices]
  );

  function updateLine(index, field, value) {
    const nextLines = invoiceForm.lines.map((line, lineIndex) =>
      lineIndex === index ? { ...line, [field]: value } : line
    );
    setInvoiceForm({ ...invoiceForm, lines: nextLines });
  }

  function addLine() {
    setInvoiceForm({
      ...invoiceForm,
      lines: [...invoiceForm.lines, { itemId: "", description: "", quantity: 1, unitPrice: 0 }]
    });
  }

  function validate() {
    if (!invoiceForm.customerId || !invoiceForm.customerName) return "Customer is required.";
    if (invoiceForm.lines.length === 0) return "At least one invoice line is required.";
    for (const line of invoiceForm.lines) {
      if (!line.itemId || !line.description || Number(line.quantity) <= 0 || Number(line.unitPrice) <= 0) {
        return "Each invoice line must include item, description, quantity, and price.";
      }
    }
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const payload = {
      customerId: invoiceForm.customerId,
      customerName: invoiceForm.customerName,
      txnDate: invoiceForm.txnDate,
      dueDate: invoiceForm.dueDate,
      taxAmount: Number(invoiceForm.taxAmount) || 0,
      lines: invoiceForm.lines.map((line) => ({
        itemId: line.itemId,
        description: line.description,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice)
      }))
    };

    try {
      setMessage("");
      if (invoiceForm.id) {
        await api.put(`/invoices/${invoiceForm.id}`, payload);
        setMessage("Invoice updated in QuickBooks and SQL.");
      } else {
        await api.post("/invoices", payload);
        setMessage("Invoice created in QuickBooks and SQL.");
      }

      setTimeout(() => setMessage(""), 3500);
      setError("");
      setInvoiceForm(emptyInvoice());
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCreate() {
    setInvoiceForm(emptyInvoice());
    setError("");
    setModalOpen(true);
  }

  function handleEdit(invoice) {
    setInvoiceForm({
      id: invoice.id,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      txnDate: invoice.txnDate.slice(0, 10),
      dueDate: invoice.dueDate.slice(0, 10),
      taxAmount: invoice.taxAmount || 0,
      lines: invoice.lines.map((line) => ({ ...line }))
    });
    setError("");
    setModalOpen(true);
  }

  async function handleDelete(id) {
    try {
      setMessage("");
      setError("");
      await api.delete(`/invoices/${id}`);
      setMessage("Invoice deleted from QuickBooks and SQL.");
      setTimeout(() => setMessage(""), 3500);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-header card-header ">
        <div>
          <p className="eyebrow">Invoice Workspace</p>
          <h2>Invoices</h2>
          <p className="header-copy">Keep the full invoice register visible and open a modal form only when you want to create or edit.</p>
        </div>
        <div className="header-actions">
          <div className="topbar-pill">{invoices.length} stored</div>
          <button className="primary-button" onClick={handleCreate} disabled={connections.length === 0}>
            Add Invoice
          </button>
        </div>
      </section>
      {message && <div className="alert success">{message}</div>}
      {error && !modalOpen && <div className="alert error">{error}</div>}
      <section className="module-stats-grid">
        <article className="module-stat-card">
          <span>Stored invoices</span>
          <strong>{invoices.length}</strong>
          <small>Invoice records synchronized into the app workspace.</small>
        </article>
        <article className="module-stat-card">
          <span>Total billed</span>
          <strong>{formatCurrency(totalInvoiced)}</strong>
          <small>Combined invoice value visible in the current register.</small>
        </article>
        <article className="module-stat-card">
          <span>Open invoices</span>
          <strong>{openInvoices}</strong>
          <small>{connections.length ? "Invoices still requiring collection or follow-up." : "Connect a company to restore invoice operations."}</small>
        </article>
      </section>
      {connections.length === 0 && (
        <section className="panel compact-panel">
          <p className="eyebrow">Connection Required</p>
          <h3>Connect a QuickBooks company to view invoices.</h3>
          <p className="header-copy">Invoices are hidden when no company is connected.</p>
        </section>
      )}
      {connections.length > 0 && (
        <section className="panel register-panel invoice-register-panel">
          <div className="section-title compact register-toolbar">
            <div>
              <p className="eyebrow">Register</p>
              <h3>All invoice records</h3>
            </div>
            <input
              className="table-search"
              placeholder="Search customer, status, or total"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <RecordsTable
            columns={["Customer", "Dates", "Status", "Total", "Actions"]}
            rows={filteredInvoices}
            emptyMessage="No invoices saved yet."
            renderRow={(invoice) => (
              <div className="records-row invoice-row structured-invoice-row" key={invoice.id}>
                <div className="record-stack">
                  <strong>{invoice.customerName}</strong>
                  <span className="record-sub">{invoice.lines.length} line item{invoice.lines.length === 1 ? "" : "s"}</span>
                </div>
                <div className="record-stack">
                  <strong>{formatDate(invoice.txnDate)}</strong>
                  <span className="record-sub">Due {formatDate(invoice.dueDate)}</span>
                </div>
                <span className={`status-badge ${String(invoice.status || "").toLowerCase() === "paid" ? "success" : "neutral"}`}>
                  {invoice.status || "Open"}
                </span>
                <div className="amount-stack">
                  <strong>{formatCurrency(invoice.totalAmount)}</strong>
                  <span className="record-sub">Tax {formatCurrency(invoice.taxAmount || 0)} | Bal {formatCurrency(invoice.balance)}</span>
                </div>
                <div className="table-actions">
                  <button type="button" className="secondary-button" onClick={() => handleEdit(invoice)}>
                    Edit
                  </button>
                  <button type="button" className="ghost-button danger" onClick={() => handleDelete(invoice.id)}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          />
        </section>
      )}
      <Modal
        open={modalOpen}
        title={invoiceForm.id ? "Edit Invoice" : "Add Invoice"}
        onClose={() => setModalOpen(false)}
      >
        {error && <div className="alert error">{error}</div>}
        <section className="section-title">
          <div>
            <p className="eyebrow">{invoiceForm.id ? "Editing" : "Draft"}</p>
            <h3>{invoiceForm.id ? "Update invoice" : "Create invoice"}</h3>
          </div>
          <div className="topbar-pill">Total {total.toFixed(2)}</div>
        </section>
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="dual-grid">
            <label>
              Customer
              <select
                value={invoiceForm.customerId}
                onChange={(event) => {
                  const selectedCustomer = customers.find((customer) => customer.id === event.target.value);
                  setInvoiceForm({
                    ...invoiceForm,
                    customerId: event.target.value,
                    customerName: selectedCustomer?.name || selectedCustomer?.displayName || ""
                  });
                }}
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name || customer.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Transaction Date
              <input type="date" value={invoiceForm.txnDate} onChange={(event) => setInvoiceForm({ ...invoiceForm, txnDate: event.target.value })} />
            </label>
          </div>
          <label>
            Due Date
            <input type="date" value={invoiceForm.dueDate} onChange={(event) => setInvoiceForm({ ...invoiceForm, dueDate: event.target.value })} />
          </label>
          <div className="line-items">
            {invoiceForm.lines.map((line, index) => (
              <div className="line-item-grid invoice-line-card" key={index}>
                <select value={line.itemId} onChange={(event) => updateLine(index, "itemId", event.target.value)}>
                  <option value="">Select item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Description"
                  value={line.description}
                  onChange={(event) => updateLine(index, "description", event.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={line.quantity}
                  onChange={(event) => updateLine(index, "quantity", event.target.value)}
                />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(event) => updateLine(index, "unitPrice", event.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="toolbar">
            <label style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              Tax Amount
              <input style={{ width: "100px", margin: 0 }} type="number" step="0.01" min="0" value={invoiceForm.taxAmount} onChange={(event) => setInvoiceForm({ ...invoiceForm, taxAmount: event.target.value })} />
            </label>
            <button type="button" className="ghost-button" onClick={addLine}>
              Add Line
            </button>
            <strong>Total: {total.toFixed(2)}</strong>
          </div>
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="primary-button">{invoiceForm.id ? "Update Invoice" : "Create Invoice"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
