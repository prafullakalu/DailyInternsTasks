import './task2.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';

function App() {
  return (
    <div className="task2-container">
      <Navbar title="Task 2: Lego Layout" />
      
      <div className="task2-body">
        <Sidebar />
        <MainContent />
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
