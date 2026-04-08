import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Modal } from "../components/Modal";
import { RecordsTable } from "../components/RecordsTable";
import { ITEM_TYPES } from "../constants/itemTypes";
import { formatCurrency } from "../utils";

const itemTemplate = { name: "", type: "Service", incomeAccountId: "", unitPrice: "", description: "" };

export function ItemsPage() {
  const [items, setItems] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(itemTemplate);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function loadData() {
    try {
      const [itemsResponse, accountsResponse] = await Promise.all([
        api.get("/qb/items"),
        api.get("/qb/accounts")
      ]);
      setItems(itemsResponse);
      setAccounts(accountsResponse);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const serviceCount = useMemo(
    () => items.filter((item) => item.type === "Service").length,
    [items]
  );

  const averagePrice = useMemo(() => {
    const pricedItems = items.filter((item) => item.unitPrice !== null && item.unitPrice !== undefined);
    if (!pricedItems.length) {
      return 0;
    }

    const total = pricedItems.reduce((sum, item) => sum + Number(item.unitPrice || 0), 0);
    return total / pricedItems.length;
  }, [items]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return items;
    }

    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  }, [items, search]);

  async function handleSubmit(event) {
    event.preventDefault();
    const unitPrice = Number(form.unitPrice);

    if (!form.name || !form.incomeAccountId) {
      setError("Item name and income account are required.");
      return;
    }

    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      setError("Item unit price must be zero or higher.");
      return;
    }

    await api.post("/qb/items", { ...form, unitPrice });
    setForm(itemTemplate);
    setModalOpen(false);
    setMessage("Item created in QuickBooks.");
    setError("");
    loadData();
  }

  function openModal() {
    setForm(itemTemplate);
    setError("");
    setModalOpen(true);
  }

  return (
    <div className="page-stack dense-page">
      <section className="page-header compact-header">
        <div>
          <p className="eyebrow">Master Data</p>
          <h2>Items</h2>
          <p className="header-copy">Keep the item register on screen and add products or services from a focused modal.</p>
        </div>
        <div className="header-actions">
          <div className="topbar-pill">{items.length} items</div>
          <button className="primary-button" onClick={openModal}>
            Add Item
          </button>
        </div>
      </section>
      {message && <div className="alert success">{message}</div>}
      {error && !modalOpen && <div className="alert error">{error}</div>}
      <section className="module-stats-grid">
        <article className="module-stat-card">
          <span>Total items</span>
          <strong>{items.length}</strong>
          <small>Products and services available for invoicing.</small>
        </article>
        <article className="module-stat-card">
          <span>Services</span>
          <strong>{serviceCount}</strong>
          <small>Service-type records configured inside the item register.</small>
        </article>
        <article className="module-stat-card">
          <span>Average price</span>
          <strong>{formatCurrency(averagePrice)}</strong>
          <small>Average listed sales price across priced items.</small>
        </article>
      </section>
      <section className="panel register-panel">
        <div className="section-title compact">
          <div>
            <p className="eyebrow">Register</p>
            <h3>All item records</h3>
          </div>
          <input
            className="table-search"
            placeholder="Search item name, type, or price"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <RecordsTable
          columns={["Name", "Type", "Price", "Description"]}
          rows={rows}
          emptyMessage="No items found."
          renderRow={(item) => (
            <div className="records-row four-column" key={item.id}>
              <div className="record-stack">
                <strong>{item.name}</strong>
                <span className="record-sub">Income account linked</span>
              </div>
              <span>{item.type || "-"}</span>
              <span>{item.unitPrice === null || item.unitPrice === undefined ? "-" : formatCurrency(item.unitPrice)}</span>
              <span>{item.description || "-"}</span>
            </div>
          )}
        />
      </section>
      <Modal open={modalOpen} title="Add Item" onClose={() => setModalOpen(false)}>
        {error && <div className="alert error">{error}</div>}
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Item name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>
            Type
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              {ITEM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Income account
            <select value={form.incomeAccountId} onChange={(event) => setForm({ ...form, incomeAccountId: event.target.value })}>
              <option value="">Select income account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <div className="dual-grid">
            <label>
              Unit price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={(event) => setForm({ ...form, unitPrice: event.target.value })}
              />
            </label>
            <label>
              Description
              <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="primary-button">Save Item</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
