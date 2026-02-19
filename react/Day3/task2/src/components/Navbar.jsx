import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">MyPortfolio</h2>
      <div className="navLinks">
        <NavLink to="/" className="navItem">
          Home
        </NavLink>
        <NavLink to="/about" className="navItem">
          About
        </NavLink>
        <NavLink to="/user/101" className="navItem">
          User 101
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
