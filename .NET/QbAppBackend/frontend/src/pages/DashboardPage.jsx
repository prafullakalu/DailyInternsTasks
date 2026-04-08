import { useEffect, useState } from "react";
import { api } from "../api";
import { formatDate } from "../utils";

export function DashboardPage() {
  const [data, setData] = useState({ user: null, connections: [], invoices: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [user, connections, invoices] = await Promise.all([
          api.get("/auth/me"),
          api.get("/qb/connections"),
          api.get("/invoices")
        ]);
        setData({ user, connections, invoices });
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, []);

  return (
    <div className="page-stack">
      <section className="hero-strip">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Track your QuickBooks workspace.</h2>
          <p className="hero-subcopy">
            See connection readiness and invoice volume at a glance.
          </p>
        </div>
        <div className="hero-badge-card">
          <span>Operator</span>
          <strong>{data.user?.fullName || data.user?.email || "Intuit Account"}</strong>
          <small>{data.user?.authProvider || "local"} sign-in</small>
        </div>
      </section>
      {error && <div className="alert error">{error}</div>}
      <section className="stats-grid">
        <article className="metric-card">
          <span>Connected companies</span>
          <strong>{data.connections.length}</strong>
          <small>{data.connections.length ? "At least one company is available for sync." : "Connect QuickBooks to continue."}</small>
        </article>
        <article className="metric-card">
          <span>Invoices stored in SQL</span>
          <strong>{data.invoices.length}</strong>
          <small>{data.connections.length ? "Persistent invoice history for edit and delete workflows." : "Invoice records stay hidden until a company is connected."}</small>
        </article>
        <article className="metric-card">
          <span>Latest invoice date</span>
          <strong>{data.invoices[0] ? formatDate(data.invoices[0].txnDate) : "None"}</strong>
          <small>{data.invoices[0] ? data.invoices[0].customerName : data.connections.length ? "Create your first invoice." : "No invoice date while QuickBooks is disconnected."}</small>
        </article>
      </section>
      <section className="panel compact-panel">
        <div className="section-title compact">
          <div>
            <p className="eyebrow">Status</p>
            <h3>Operational summary</h3>
          </div>
        </div>
        <div className="summary-list">
          <div className="summary-row"><span>Authentication</span><strong>{data.user ? "Active" : "Pending"}</strong></div>
          <div className="summary-row"><span>QuickBooks connection</span><strong>{data.connections.length ? "Ready" : "Not connected"}</strong></div>
          <div className="summary-row"><span>Invoice persistence</span><strong>{data.connections.length ? (data.invoices.length ? "Receiving records" : "No records yet") : "Hidden until connected"}</strong></div>
        </div>
      </section>
    </div>
  );
}
