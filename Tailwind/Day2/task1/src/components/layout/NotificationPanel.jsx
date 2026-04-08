import { useSelector, useDispatch } from "react-redux"
import { toggleNotification } from "../../features/ui/uiSlice"

function NotificationPanel() {
  const dispatch = useDispatch()
  const isOpen = useSelector(state => state.ui.isNotificationOpen)

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => dispatch(toggleNotification())}
        />
      )}

      <div
        className={`
          fixed top-0 right-0 h-full w-80
          backdrop-blur-xl
          bg-white/10 dark:bg-white/5
          border-l border-white/20
          shadow-2xl
          transform transition-transform duration-300
          z-50
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="
          p-4
          border-b border-white/20
          font-semibold
          flex justify-between items-center
          text-gray-900 dark:text-white
        ">
          <span>Notifications</span>

          <button
            onClick={() => dispatch(toggleNotification())}
            className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 text-sm text-gray-800 dark:text-gray-200">
          No new notifications
        </div>
      </div>
    </>
  )
}

export default NotificationPanel