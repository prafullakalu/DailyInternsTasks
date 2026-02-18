import './task3.css';
import Navbar from './components/Navbar';
import StatusItem from './components/StatusItem';

function App() {
  const servers = [
    { id: 1, name: 'Database Server', status: 'Online' },
    { id: 2, name: 'API Gateway', status: 'Maintenance' },
    { id: 3, name: 'Cache Server', status: 'Online' },
    { id: 4, name: 'Message Queue', status: 'Maintenance' },
    { id: 5, name: 'Web Server', status: 'Online' }
  ];

  return (
    <div className="task3-container">
      <Navbar title="Task 3: Status Dashboard" />
      <div className="task3-dashboard">
        <div className="task3-header">
          <h2>🖥️ Server Status Monitor</h2>
          <p>View server status with color-coded indicators - Green for Online, Orange for Maintenance</p>
        </div>
        <div className="task3-list">
          {servers.map(server => (
            <StatusItem
              key={server.id}
              server={server}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
