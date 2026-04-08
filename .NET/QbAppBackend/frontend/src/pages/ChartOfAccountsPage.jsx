import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Modal } from "../components/Modal";
import { RecordsTable } from "../components/RecordsTable";

const accountTemplate = { name: "", accountType: "", accountSubType: "" };

export function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(accountTemplate);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadAccounts() {
    try {
      const response = await api.get("/qb/accounts");
      setAccounts(response);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  const accountTypeCount = useMemo(
    () => new Set(accounts.map((account) => account.type).filter(Boolean)).size,
    [accounts]
  );

  const accountSubTypeCount = useMemo(
    () => new Set(accounts.map((account) => account.subType || account.accountSubType).filter(Boolean)).size,
    [accounts]
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return accounts;
    }

    return accounts.filter((account) =>
      `${account.name} ${account.type || ""} ${account.id}`.toLowerCase().includes(term)
    );
  }, [accounts, search]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name || !form.accountType) {
      setError("Account name and type are required.");
      return;
    }

    await api.post("/qb/accounts", form);
    setForm(accountTemplate);
    setModalOpen(false);
    setMessage("Account created in QuickBooks.");
    setError("");
    loadAccounts();
  }

  async function handleSync() {
    setSyncing(true);
    setMessage("");
    setError("");

    try {
      await api.get("/qb/accounts");
      await loadAccounts();
      setMessage("Chart of Accounts synced from QuickBooks.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  function openModal() {
    setForm(accountTemplate);
    setError("");
    setModalOpen(true);
  }

  return (
    <div className="page-stack dense-page">
      <section className="page-header compact-header">
        <div>
          <p className="eyebrow">Master Data</p>
          <h2>Chart of Accounts</h2>
          <p className="header-copy">Open the full account register first, then add a new account from the top corner.</p>
        </div>
        <div className="header-actions">
          <div className="topbar-pill">{accounts.length} accounts</div>
          <button className="secondary-button" onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync"}
          </button>
          <button className="primary-button" onClick={openModal}>
            Add Account
          </button>
        </div>
      </section>
      {message && <div className="alert success">{message}</div>}
      {error && !modalOpen && <div className="alert error">{error}</div>}
      <section className="module-stats-grid">
        <article className="module-stat-card">
          <span>Total accounts</span>
          <strong>{accounts.length}</strong>
          <small>All account records currently pulled from QuickBooks.</small>
        </article>
        <article className="module-stat-card">
          <span>Account types</span>
          <strong>{accountTypeCount}</strong>
          <small>Distinct top-level classifications across the register.</small>
        </article>
        <article className="module-stat-card">
          <span>Subtypes</span>
          <strong>{accountSubTypeCount}</strong>
          <small>Granular structure available for posting and reporting.</small>
        </article>
      </section>
      <section className="panel register-panel">
        <div className="section-title compact">
          <div>
            <p className="eyebrow">Register</p>
            <h3>All account records</h3>
          </div>
          <input
            className="table-search"
            placeholder="Search account name, type, or id"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <RecordsTable
          columns={["Name", "Type", "Subtype", "Id"]}
          rows={rows}
          emptyMessage="No accounts found."
          renderRow={(account) => (
            <div className="records-row four-column" key={account.id}>
              <div className="record-stack">
                <strong>{account.name}</strong>
                <span className="record-sub">QuickBooks account</span>
              </div>
              <span>{account.type || "-"}</span>
              <span>{account.subType || account.accountSubType || "-"}</span>
              <code className="record-code">{account.id}</code>
            </div>
          )}
        />
      </section>
      <Modal open={modalOpen} title="Add Account" onClose={() => setModalOpen(false)}>
        {error && <div className="alert error">{error}</div>}
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Account name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>
            Account type
            <input value={form.accountType} onChange={(event) => setForm({ ...form, accountType: event.target.value })} />
          </label>
          <label>
            Account subtype
            <input value={form.accountSubType} onChange={(event) => setForm({ ...form, accountSubType: event.target.value })} />
          </label>
          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="primary-button">Save Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
