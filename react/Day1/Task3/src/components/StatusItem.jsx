function StatusItem({ server }) {
  // Get status class based on status prop
  const getStatusClass = (status) => {
    if (status === 'Online') return 'online';
    if (status === 'Maintenance') return 'maintenance';
    return 'offline';
  };

  const getDotClass = (status) => {
    if (status === 'Online') return 'online';
    if (status === 'Maintenance') return 'maintenance';
    return 'offline';
  };

  const statusClass = getStatusClass(server.status);
  const dotClass = getDotClass(server.status);

  return (
    <div className={`task3-item ${statusClass}`}>
      <div className="task3-item-content">
        <h4 className="task3-item-name">{server.name}</h4>
        <div className="task3-status-display">
          <span className={`task3-status-dot ${dotClass}`}></span>
          <span className="task3-status-text">
            {server.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatusItem;
