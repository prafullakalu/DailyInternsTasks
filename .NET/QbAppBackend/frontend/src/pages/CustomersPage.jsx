import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Modal } from "../components/Modal";
import { RecordsTable } from "../components/RecordsTable";
import { validateEmail } from "../utils";

const customerTemplate = { companyName: "", displayName: "", email: "", phone: "", mobile: "", fax: "", cc: "", bcc: "" };

export function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(customerTemplate);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function loadCustomers() {
    try {
      const response = await api.get("/qb/customers");
      setCustomers(response);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const customersWithEmail = useMemo(
    () => customers.filter((customer) => customer.email).length,
    [customers]
  );

  const customersWithPhone = useMemo(
    () => customers.filter((customer) => customer.phone).length,
    [customers]
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return customers;
    }

    return customers.filter((customer) => JSON.stringify(customer).toLowerCase().includes(term));
  }, [customers, search]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.displayName) {
      setError("Customer name is required.");
      return;
    }

    if (form.email && !validateEmail(form.email)) {
      setError("Customer email is invalid.");
      return;
    }

    await api.post("/qb/customers", form);
    setForm(customerTemplate);
    setModalOpen(false);
    setMessage("Customer created in QuickBooks.");
    setTimeout(() => setMessage(""), 3500);
    setError("");
    loadCustomers();
  }

  function openModal() {
    setForm(customerTemplate);
    setError("");
    setModalOpen(true);
  }

  return (
    <div className="page-stack dense-page">
      <section className="page-header compact-header">
        <div>
          <p className="eyebrow">Master Data</p>
          <h2>Customers</h2>
          <p className="header-copy">Show the full customer list first and create new customers in a modal window.</p>
        </div>
        <div className="header-actions">
          <div className="topbar-pill">{customers.length} customers</div>
          <button className="primary-button" onClick={openModal}>
            Add Customer
          </button>
        </div>
      </section>
      {message && <div className="alert success">{message}</div>}
      {error && !modalOpen && <div className="alert error">{error}</div>}
      <section className="module-stats-grid">
        <article className="module-stat-card">
          <span>Total customers</span>
          <strong>{customers.length}</strong>
          <small>Customer records available for invoice and relationship workflows.</small>
        </article>
        <article className="module-stat-card">
          <span>With email</span>
          <strong>{customersWithEmail}</strong>
          <small>Customers that can receive email-driven operational follow-up.</small>
        </article>
        <article className="module-stat-card">
          <span>With phone</span>
          <strong>{customersWithPhone}</strong>
          <small>Customers with a reachable phone number stored in the register.</small>
        </article>
      </section>
      <section className="panel register-panel">
        <div className="section-title compact">
          <div>
            <p className="eyebrow">Register</p>
            <h3>All customer records</h3>
          </div>
          <input
            className="table-search"
            placeholder="Search customer name, email, or phone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <RecordsTable
          columns={["Name", "Email", "Phone", "Id"]}
          rows={rows}
          emptyMessage="No customers found."
          renderRow={(customer) => (
            <div className="records-row four-column" key={customer.id}>
              <div className="record-stack">
                <strong>{customer.name || customer.displayName} {customer.companyName ? `(${customer.companyName})` : ""}</strong>
                <span className="record-sub">Customer master record</span>
              </div>
              <span>{customer.email || "-"}</span>
              <span>{customer.phone || "-"}</span>
              <code className="record-code">{customer.id}</code>
            </div>
          )}
        />
      </section>
      <Modal open={modalOpen} title="Add Customer" onClose={() => setModalOpen(false)}>
        {error && <div className="alert error">{error}</div>}
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Company name (optional)
            <input value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} />
          </label>
          <label>
            Display name *
            <input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} />
          </label>
          <label>
            Email
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <div className="dual-grid">
            <label>
              Phone
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
            <label>
              Mobile
              <input value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
            </label>
          </div>
          <div className="dual-grid">
            <label>
              Fax
              <input value={form.fax} onChange={(event) => setForm({ ...form, fax: event.target.value })} />
            </label>
            <label>
              Cc
              <input value={form.cc} onChange={(event) => setForm({ ...form, cc: event.target.value })} />
            </label>
          </div>
          <label>
            Bcc
            <input value={form.bcc} onChange={(event) => setForm({ ...form, bcc: event.target.value })} />
          </label>
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="primary-button">Save Customer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
