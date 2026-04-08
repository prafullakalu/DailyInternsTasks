export function RecordsTable({ columns, rows, emptyMessage, renderRow }) {
  return (
    <div className="records-table">
      <div
        className="records-head"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      <div className="records-body">
        {rows.length === 0 && <p className="muted table-empty">{emptyMessage}</p>}
        {rows.map((row) => renderRow(row))}
      </div>
    </div>
  );
}
