function MainContent() {
  return (
    <main className="task2-main">
      <h3>Welcome to the main content area</h3>
      <p>This is where your page content goes.</p>
      <div className="task2-card-container">
        <div className="task2-card">
          <h4>🎯 Task Overview</h4>
          <p>This is Task 2: The "Lego" Layout component.</p>
        </div>
        <div className="task2-card">
          <h4>📚 Learning Goal</h4>
          <p>Master component reusability by assembling independent components.</p>
        </div>
        <div className="task2-card">
          <h4>🏗️ Components Used</h4>
          <p>Navbar, Sidebar, MainContent, and Footer working together.</p>
        </div>
      </div>
    </main>
  );
}

export default MainContent;
