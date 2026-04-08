import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { CompanyCard } from "../components/CompanyCard";

export function ConnectionsPage() {
  const [searchParams] = useSearchParams();
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(searchParams.get("connected") ? "QuickBooks company connected successfully." : "");
  const [syncing, setSyncing] = useState(false);

  async function loadConnections() {
    try {
      const result = await api.get("/qb/connections");
      setConnections(result);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadConnections();
    if (message) setTimeout(() => setMessage(""), 3500);
  }, []);

  async function handleConnect() {
    const response = await api.get("/qb/connect-url");
    window.location.href = response.url;
  }

  async function handleDisconnect(realmId) {
    await api.delete(`/qb/connections/${realmId}`);
    setMessage("Company disconnected.");
    setTimeout(() => setMessage(""), 3500);
    loadConnections();
  }

  async function handleSync() {
    setSyncing(true);
    setMessage("");
    setError("");
    try {
      await loadConnections();
      setMessage("Connections synced from QuickBooks.");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', maxWidth: '1200px', minHeight: 'auto' }}>
        <div style={{ maxWidth: '700px' }}>
          <h2 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem' }}>QuickBooks companies</h2>
          <p className="header-copy" style={{ margin: 0, fontSize: '0.85rem' }}>Manage connected workspace companies and keep the sync register current.</p>
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync"}
          </button>
          <button className="primary-button" onClick={handleConnect}>Connect QuickBooks</button>
        </div>
      </section>
      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
      <section className="panel compact-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Register</p>
            <h3>Authorized companies</h3>
          </div>
          <div className="topbar-pill">{connections.length} listed</div>
        </div>
        <div className="list-stack">
          {connections.length === 0 && <p className="muted">No QuickBooks company connected yet.</p>}
          {connections.map((connection) => (
            <CompanyCard 
              key={connection.realmId} 
              connection={connection} 
              onDisconnect={handleDisconnect} 
            />
          ))}
        </div>
      </section>
    </div>
  );
}
