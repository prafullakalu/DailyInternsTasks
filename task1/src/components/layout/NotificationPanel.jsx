import { useSelector, useDispatch } from "react-redux"

function NotificationPanel() {
  const dispatch = useDispatch()
  const isOpen = useSelector(
    state => state.ui.isNotificationOpen
  )

  return (
    <div
      className={`
        fixed top-0 right-0 h-full w-80
        bg-white dark:bg-gray-800
        shadow-soft
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      <div className="p-4 bg-blue border-b font-semibold flex justify-between items-center">
        <span>Notifications</span>
        <button
          onClick={() => dispatch({ type: "ui/toggleNotification" })}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
        >
          ✕
        </button>
      </div>
      <div className="p-4 text-sm">
        No new notifications
      </div>
    </div>
  )
}

export default NotificationPanel