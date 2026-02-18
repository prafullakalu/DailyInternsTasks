import './task1.css';
import UserCard from './components/UserCard';

function App() {
  const users = [
    {
      id: 1,
      name: 'Prafulla',
      role: 'Frontend Developer',
      isAvailable: false
    },
    {
      id: 2,
      name: 'Amit',
      role: 'Backend Developer',
      isAvailable: false
    },
    {
      id: 3,
      name: 'Sneha',
      role: 'UI/UX Designer',
      isAvailable: true
    }
  ];

  return (
    <div className="task1-container">
      <header className="task1-header">
        <h1>👥 Profile Card Library</h1>
        <p>Master component reusability with Props</p>
      </header>

      <div className="task1-grid">
        {users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

export default App;
