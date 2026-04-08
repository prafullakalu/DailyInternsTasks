import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 7000 },
]

function RevenueChart() {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl h-80 border border-slate-200 dark:border-slate-700">
      
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
        Revenue Overview
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />

          <XAxis 
            dataKey="month" 
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
          />

          <YAxis 
            stroke="#94a3b8"
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              borderRadius: "12px",
              border: "none",
            }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#a78bfa" }}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#8b5cf6"
            strokeWidth={3}
            fill="url(#colorRevenue)"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart