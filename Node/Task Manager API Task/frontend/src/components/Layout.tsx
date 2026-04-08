import React, { type ReactNode, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Search,
  Settings as SettingsIcon,
  Sun,
  Moon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/theme';
import { TaskModalProvider, NEW_TASK_EVENT } from '../context/taskModal';

const primaryNavigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My tasks', path: '/my-tasks', icon: CheckCircle },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

const tertiaryNavigation = [{ name: 'Settings', path: '/settings', icon: SettingsIcon }];

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const initials = (user.name
    ? user.name
        .split(' ')
        .map((chunk: string) => chunk[0])
        .slice(0, 2)
        .join('')
    : 'TG'
  ).toUpperCase();

  const handleNewTask = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(NEW_TASK_EVENT));
    }
  };

  const goNotifications = () => navigate('/notifications');
  const goSettings = () => navigate('/settings');

  return (
    <TaskModalProvider>
      <div className={`organizo-shell ${theme}`}>
        <aside className="organizo-sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">AŽ</div>
            <div>
              <p>Organizo</p>
              <small>Task manager</small>
            </div>
          </div>
          <nav className="sidebar-nav">
            {primaryNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'is-active' : ''}`
                  }
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            {tertiaryNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link tertiary ${isActive ? 'is-active' : ''}`
                  }
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
            <button type="button" className="sidebar-link tertiary" onClick={onLogout}>
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <div className="organizo-content">
          <header className="organizo-top">
            <div className="search-input">
              <Search size={16} />
              <input type="text" placeholder="Search" aria-label="Search tasks" />
            </div>
            <div className="top-actions">
              <button type="button" className="new-task" onClick={handleNewTask}>
                + New task
              </button>
              <button type="button" className="icon-button" aria-label="Notifications" onClick={goNotifications}>
                <Mail size={18} />
              </button>
              <button type="button" className="icon-button" aria-label="Toggle theme" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button type="button" className="avatar-button" aria-label="Profile options" onClick={goSettings}>
                <div className="avatar-dot">
                  <span>{initials}</span>
                </div>
              </button>
            </div>
          </header>

          <main className="organizo-main">{children}</main>
        </div>
      </div>
    </TaskModalProvider>
  );
};

export default Layout;
