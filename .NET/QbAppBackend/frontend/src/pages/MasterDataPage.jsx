import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { ITEM_TYPES } from "../constants/itemTypes";
import { validateEmail } from "../utils";

const accountTemplate = { name: "", accountType: "", accountSubType: "" };
const customerTemplate = { displayName: "", email: "", phone: "" };
const itemTemplate = { name: "", type: "Service", incomeAccountId: "", unitPrice: "", description: "" };

const sections = [
  { key: "account", label: "Accounts" },
  { key: "customer", label: "Customers" },
  { key: "item", label: "Items" }
];

export function MasterDataPage() {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [forms, setForms] = useState({
    account: accountTemplate,
    customer: customerTemplate,
    item: itemTemplate
  });
  const [activeSection, setActiveSection] = useState("account");
  const [accountSearch, setAccountSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const filteredAccounts = useMemo(() => {
    const term = accountSearch.trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter((account) =>
      `${account.name} ${account.type || ""} ${account.id}`.toLowerCase().includes(term)
    );
  }, [accounts, accountSearch]);

  async function handleCreateAccount(event) {
    event.preventDefault();
    if (!forms.account.name || !forms.account.accountType) return setError("Account name and type are required.");
    await api.post("/qb/accounts", forms.account);
    setForms((current) => ({ ...current, account: accountTemplate }));
    setMessage("Account created in QuickBooks.");
    setError("");
    loadData();
  }

  async function handleCreateCustomer(event) {
    event.preventDefault();
    if (!forms.customer.displayName) return setError("Customer name is required.");
    if (forms.customer.email && !validateEmail(forms.customer.email)) return setError("Customer email is invalid.");
    await api.post("/qb/customers", forms.customer);
    setForms((current) => ({ ...current, customer: customerTemplate }));
    setMessage("Customer created in QuickBooks.");
    setError("");
    loadData();
  }

  async function handleCreateItem(event) {
    event.preventDefault();
    const unitPrice = Number(forms.item.unitPrice);
    if (!forms.item.name || !forms.item.incomeAccountId) return setError("Item name and income account are required.");
    if (Number.isNaN(unitPrice) || unitPrice < 0) return setError("Item unit price must be zero or higher.");
    await api.post("/qb/items", { ...forms.item, unitPrice });
    setForms((current) => ({ ...current, item: itemTemplate }));
    setMessage("Item created in QuickBooks.");
    setError("");
    loadData();
  }

  return (
    <div className="page-stack dense-page">
      <section className="page-header compact-header">
        <div>
          <p className="eyebrow">Master Data</p>
          <h2>Maintain accounts, customers, and item mappings.</h2>
        </div>
        <div className="header-metrics">
          <span>{accounts.length} accounts</span>
          <span>{customers.length} customers</span>
          <span>{items.length} items</span>
        </div>
      </section>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <section className="master-grid">
        <aside className="master-sidebar">
          <div className="panel slim-panel">
            <p className="eyebrow">Create</p>
            <div className="segmented-control">
              {sections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  className={`segment ${activeSection === section.key ? "active" : ""}`}
                  onClick={() => setActiveSection(section.key)}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {activeSection === "account" && (
            <form className="panel slim-panel form-stack" onSubmit={handleCreateAccount}>
              <div className="section-title compact">
                <div>
                  <p className="eyebrow">Account</p>
                  <h3>Create account</h3>
                </div>
              </div>
              <label>
                Account name
                <input value={forms.account.name} onChange={(e) => setForms({ ...forms, account: { ...forms.account, name: e.target.value } })} />
              </label>
              <label>
                Account type
                <input value={forms.account.accountType} onChange={(e) => setForms({ ...forms, account: { ...forms.account, accountType: e.target.value } })} />
              </label>
              <label>
                Account subtype
                <input value={forms.account.accountSubType} onChange={(e) => setForms({ ...forms, account: { ...forms.account, accountSubType: e.target.value } })} />
              </label>
              <button className="primary-button">Save Account</button>
            </form>
          )}

          {activeSection === "customer" && (
            <form className="panel slim-panel form-stack" onSubmit={handleCreateCustomer}>
              <div className="section-title compact">
                <div>
                  <p className="eyebrow">Customer</p>
                  <h3>Create customer</h3>
                </div>
              </div>
              <label>
                Display name
                <input value={forms.customer.displayName} onChange={(e) => setForms({ ...forms, customer: { ...forms.customer, displayName: e.target.value } })} />
              </label>
              <label>
                Email
                <input value={forms.customer.email} onChange={(e) => setForms({ ...forms, customer: { ...forms.customer, email: e.target.value } })} />
              </label>
              <label>
                Phone
                <input value={forms.customer.phone} onChange={(e) => setForms({ ...forms, customer: { ...forms.customer, phone: e.target.value } })} />
              </label>
              <button className="primary-button">Save Customer</button>
            </form>
          )}

          {activeSection === "item" && (
            <form className="panel slim-panel form-stack" onSubmit={handleCreateItem}>
              <div className="section-title compact">
                <div>
                  <p className="eyebrow">Item</p>
                  <h3>Create item</h3>
                </div>
              </div>
              <label>
                Item name
                <input value={forms.item.name} onChange={(e) => setForms({ ...forms, item: { ...forms.item, name: e.target.value } })} />
              </label>
              <label>
                Type
                <select value={forms.item.type} onChange={(e) => setForms({ ...forms, item: { ...forms.item, type: e.target.value } })}>
                  {ITEM_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                Income account
                <select value={forms.item.incomeAccountId} onChange={(e) => setForms({ ...forms, item: { ...forms.item, incomeAccountId: e.target.value } })}>
                  <option value="">Select income account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </label>
              <div className="dual-grid compact-grid">
                <label>
                  Unit price
                  <input type="number" min="0" step="0.01" value={forms.item.unitPrice} onChange={(e) => setForms({ ...forms, item: { ...forms.item, unitPrice: e.target.value } })} />
                </label>
                <label>
                  Description
                  <input value={forms.item.description} onChange={(e) => setForms({ ...forms, item: { ...forms.item, description: e.target.value } })} />
                </label>
              </div>
              <button className="primary-button">Save Item</button>
            </form>
          )}
        </aside>

        <section className="panel ledger-panel">
          <div className="section-title compact">
            <div>
              <p className="eyebrow">Reference Data</p>
              <h3>{activeSection === "account" ? "Account mappings" : activeSection === "customer" ? "Customer directory" : "Item catalog"}</h3>
            </div>
            {activeSection === "account" && (
              <input
                className="table-search"
                placeholder="Search account name, type, or id"
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
              />
            )}
          </div>

          {activeSection === "account" && (
            <div className="ledger-table">
              <div className="ledger-head">
                <span>Name</span>
                <span>Type</span>
                <span>Id</span>
              </div>
              <div className="ledger-body">
                {filteredAccounts.length === 0 && <p className="muted">No accounts found.</p>}
                {filteredAccounts.map((account) => (
                  <div key={account.id} className="ledger-row">
                    <strong>{account.name}</strong>
                    <span>{account.type || "-"}</span>
                    <code>{account.id}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "customer" && (
            <div className="ledger-table">
              <div className="ledger-head">
                <span>Name</span>
                <span>Email</span>
                <span>Phone</span>
              </div>
              <div className="ledger-body">
                {customers.length === 0 && <p className="muted">No customers found.</p>}
                {customers.map((customer) => (
                  <div key={customer.id} className="ledger-row">
                    <strong>{customer.name}</strong>
                    <span>{customer.email || "-"}</span>
                    <span>{customer.phone || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "item" && (
            <div className="ledger-table">
              <div className="ledger-head">
                <span>Name</span>
                <span>Type</span>
                <span>Unit price</span>
              </div>
              <div className="ledger-body">
                {items.length === 0 && <p className="muted">No items found.</p>}
                {items.map((item) => (
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
