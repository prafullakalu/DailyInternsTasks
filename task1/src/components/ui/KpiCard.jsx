function KpiCard({ title, value, className = "" }) {
  return (
    <div className={`p-6 rounded-xl shadow-soft ${className} bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800 dark:to-purple-800`}
    >
      <h3 className="text-sm text-gray-600 dark:text-gray-300">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}

export default KpiCard