function RecentActivity() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft">
      <h3 className="font-semibold mb-4">Recent Activity</h3>

      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Name</th>
              <th>Action</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">John Doe</td>
              <td>Added</td>
              <td>Today</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        <div className="p-3 border rounded-lg">
          <p className="font-medium">John Doe</p>
          <p className="text-xs text-muted">Added • Today</p>
        </div>
      </div>
    </div>
  )
}

export default RecentActivity