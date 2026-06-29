import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 250);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMenuOpen(true);
  };

  return (
    <nav className="navbar">

      <div className="logo">EcoCampus</div>

      <div className="nav-links">

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/my-materials">Meus Materiais</Link>

        <div
          className="dropdown-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="dropdown-button">Mais ▼</button>

          {menuOpen && (
            <div className="dropdown-menu">
              <Link to="/requests">Solicitações</Link>
              <Link to="/notifications">Notificações</Link>
              <Link to="/history">Histórico</Link>
              <Link to="/reputation">Reputação</Link>
              <Link to="/gamification">Nível</Link>
              <Link to="/about">Sobre</Link>
              <Link to="/help">Ajuda</Link>
            </div>
          )}
        </div>

      </div>

      <div className="user-menu">
        <Link to="/profile">
          <button>Perfil</button>
        </Link>
      </div>

    </nav>
  );
}
