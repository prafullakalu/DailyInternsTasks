function KpiCard({ title, value, className = "" }) {
  return (
    <div
      className={`p-6 rounded-2xl shadow-xl text-white
      transition-all duration-300 hover:scale-105
      ${className}`}
    >
      <h3 className="text-sm text-white/80 tracking-wide">
        {title}
      </h3>

      <p className="text-3xl font-bold mt-3">
        {value}
      </p>
    </div>
  )
}

export default KpiCard