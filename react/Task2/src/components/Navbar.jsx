function Navbar({ title }) {
  return (
    <nav className="task2-navbar">
      <div className="task2-navbar-content">
        <h1>📦 {title}</h1>
        <div className="task2-navbar-items">
          <span className="task2-navbar-item">React Learning</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
