function Navbar({ title }) {
  return (
    <nav className="task3-navbar">
      <div className="task3-navbar-content">
        <h1>📦 {title}</h1>
        <div className="task3-navbar-items">
          <span className="task3-navbar-item">React Learning</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
