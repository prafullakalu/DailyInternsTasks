import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { ITEM_TYPES } from "../constants/itemTypes";
import { masterDataLinks } from "../constants/navigation";
import { ModuleTabs } from "../components/ModuleTabs";
import { validateEmail } from "../utils";

const accountTemplate = { name: "", accountType: "", accountSubType: "" };
const customerTemplate = { displayName: "", email: "", phone: "" };
const itemTemplate = { name: "", type: "Service", incomeAccountId: "", unitPrice: "", description: "" };

const moduleConfig = {
  accounts: {
    title: "Chart of Accounts",
    subtitle: "Manage QuickBooks account mappings.",
    syncPath: "/qb/accounts"
  },
  customers: {
    title: "Customers",
    subtitle: "Maintain customer records from QuickBooks.",
    syncPath: "/qb/customers"
  },
  items: {
    title: "Items",
    subtitle: "Maintain item and service definitions.",
    syncPath: "/qb/items"
  }
};

export function MasterDataModulePage({ moduleKey }) {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [accountForm, setAccountForm] = useState(accountTemplate);
  const [customerForm, setCustomerForm] = useState(customerTemplate);
  const [itemForm, setItemForm] = useState(itemTemplate);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const config = moduleConfig[moduleKey];

  async function loadData() {
    try {
      const [accountsResponse, customersResponse, itemsResponse] = await Promise.all([
        api.get("/qb/accounts"),
        api.get("/qb/customers"),
        api.get("/qb/items")
      ]);
      setAccounts(accountsResponse);
      setCustomers(customersResponse);
      setItems(itemsResponse);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const source =
      moduleKey === "accounts" ? accounts :
      moduleKey === "customers" ? customers :
      items;

    if (!term) {
      return source;
    }

    return source.filter((row) => JSON.stringify(row).toLowerCase().includes(term));
  }, [accounts, customers, items, moduleKey, search]);

  async function handleSync() {
    setSyncing(true);
    setMessage("");
    setError("");
    try {
      await api.get(config.syncPath);
      await loadData();
      setMessage(`${config.title} synced from QuickBooks.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleCreateAccount(event) {
    event.preventDefault();
    if (!accountForm.name || !accountForm.accountType) return setError("Account name and type are required.");
    await api.post("/qb/accounts", accountForm);
    setAccountForm(accountTemplate);
    setMessage("Account created in QuickBooks.");
    setError("");
    loadData();
  }

  async function handleCreateCustomer(event) {
    event.preventDefault();
    if (!customerForm.displayName) return setError("Customer name is required.");
    if (customerForm.email && !validateEmail(customerForm.email)) return setError("Customer email is invalid.");
    await api.post("/qb/customers", customerForm);
    setCustomerForm(customerTemplate);
    setMessage("Customer created in QuickBooks.");
    setError("");
    loadData();
  }

  async function handleCreateItem(event) {
    event.preventDefault();
    const unitPrice = Number(itemForm.unitPrice);
    if (!itemForm.name || !itemForm.incomeAccountId) return setError("Item name and income account are required.");
    if (Number.isNaN(unitPrice) || unitPrice < 0) return setError("Item unit price must be zero or higher.");
    await api.post("/qb/items", { ...itemForm, unitPrice });
    setItemForm(itemTemplate);
    setMessage("Item created in QuickBooks.");
    setError("");
    loadData();
  }

  return (
    <div className="page-stack dense-page">
      <section className="page-header compact-header">
        <div>
          <p className="eyebrow">Master Data</p>
          <h2>{config.title}</h2>
          <p className="header-copy">{config.subtitle}</p>
        </div>
        <button className="secondary-button" onClick={handleSync} disabled={syncing}>
          {syncing ? "Syncing..." : "Sync from QuickBooks"}
        </button>
      </section>
      <ModuleTabs links={masterDataLinks} />
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <section className="module-screen">
        <section className="panel module-form-panel">
          {moduleKey === "accounts" && (
            <form className="form-stack" onSubmit={handleCreateAccount}>
              <div className="section-title compact"><h3>Create account</h3></div>
              <label>Account name<input value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} /></label>
              <label>Account type<input value={accountForm.accountType} onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })} /></label>
              <label>Account subtype<input value={accountForm.accountSubType} onChange={(e) => setAccountForm({ ...accountForm, accountSubType: e.target.value })} /></label>
              <button className="primary-button">Save Account</button>
            </form>
          )}
          {moduleKey === "customers" && (
            <form className="form-stack" onSubmit={handleCreateCustomer}>
              <div className="section-title compact"><h3>Create customer</h3></div>
              <label>Display name<input value={customerForm.displayName} onChange={(e) => setCustomerForm({ ...customerForm, displayName: e.target.value })} /></label>
              <label>Email<input value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} /></label>
              <label>Phone<input value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} /></label>
              <button className="primary-button">Save Customer</button>
            </form>
          )}
          {moduleKey === "items" && (
            <form className="form-stack" onSubmit={handleCreateItem}>
              <div className="section-title compact"><h3>Create item</h3></div>
              <label>Item name<input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} /></label>
              <label>Type
                <select value={itemForm.type} onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}>
                  {ITEM_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label>Income account
                <select value={itemForm.incomeAccountId} onChange={(e) => setItemForm({ ...itemForm, incomeAccountId: e.target.value })}>
                  <option value="">Select income account</option>
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
              </label>
              <label>Unit price<input type="number" min="0" step="0.01" value={itemForm.unitPrice} onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })} /></label>
              <label>Description<input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} /></label>
              <button className="primary-button">Save Item</button>
            </form>
          )}
        </section>

        <section className="panel module-table-panel">
          <div className="section-title compact">
            <h3>{config.title}</h3>
            <input
              className="table-search"
              placeholder={`Search ${config.title.toLowerCase()}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {moduleKey === "accounts" && (
            <div className="ledger-table">
              <div className="ledger-head">
                <span>Name</span><span>Type</span><span>Id</span>
              </div>
              <div className="ledger-body">
                {rows.length === 0 && <p className="muted">No accounts found.</p>}
                {rows.map((account) => (
                  <div key={account.id} className="ledger-row">
                    <strong>{account.name}</strong>
                    <span>{account.type || "-"}</span>
                    <code>{account.id}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {moduleKey === "customers" && (
            <div className="ledger-table">
              <div className="ledger-head">
                <span>Name</span><span>Email</span><span>Phone</span>
              </div>
              <div className="ledger-body">
                {rows.length === 0 && <p className="muted">No customers found.</p>}
                {rows.map((customer) => (
                  <div key={customer.id} className="ledger-row">
                    <strong>{customer.name}</strong>
                    <span>{customer.email || "-"}</span>
                    <span>{customer.phone || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {moduleKey === "items" && (
            <div className="ledger-table">
              <div className="ledger-head">
                <span>Name</span><span>Type</span><span>Unit price</span>
              </div>
              <div className="ledger-body">
                {rows.length === 0 && <p className="muted">No items found.</p>}
                {rows.map((item) => (
                  <div key={item.id} className="ledger-row">
                    <strong>{item.name}</strong>
                    <span>{item.type || "-"}</span>
                    <span>{item.unitPrice ?? "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
