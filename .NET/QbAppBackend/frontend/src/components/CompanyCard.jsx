import { formatDateTime } from "../utils";

export function CompanyCard({ connection, onDisconnect }) {
  return (
    <article className="list-card company-card company-card-structured">
      <div className="company-badge">{connection.companyName.slice(0, 2).toUpperCase()}</div>
      <div className="company-content">
        <div className="company-header-row">
          <strong>{connection.companyName}</strong>
          <span className={`status-badge ${connection.isExpired ? "danger" : "success"}`}>
            {connection.isExpired ? "Expired" : "Connected"}
          </span>
        </div>
        <div className="meta-grid">
          <span>Realm {connection.realmId}</span>
          <span>Connected {formatDateTime(connection.connectedAt)}</span>
          <span>Expires {formatDateTime(connection.expiresAt)}</span>
        </div>
      </div>
      <button className="ghost-button" onClick={() => onDisconnect(connection.realmId)}>
        Disconnect
      </button>
    </article>
  );
}
