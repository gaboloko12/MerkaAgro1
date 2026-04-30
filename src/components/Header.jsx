import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaChevronDown, FaSignOutAlt, FaBox, FaEnvelope, FaUser,
  FaBars, FaTimes, FaSearch, FaShoppingCart, FaLeaf
} from "react-icons/fa";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { CATEGORIAS_CON_EMOJI } from "../utils/categorias";
import { useAuth } from "../context/AuthContext";
import "../styles/header.css";

export default function Header() {
  const [search, setSearch] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) setShowUserMenu(false);
      if (!event.target.closest('.categories-dropdown')) setShowCategories(false);
    };
    if (showUserMenu || showCategories) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu, showCategories]);

  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showMobileMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search)}`);
      setSearch("");
      setShowMobileMenu(false);
    }
  };

  const handleCategorySelect = (categoria) => {
    const categoriaLimpia = categoria.replace(/\s+[^\s]*$/, "").toLowerCase().trim();
    navigate(`/?categoria=${encodeURIComponent(categoriaLimpia)}`);
    setShowCategories(false);
    setShowMobileMenu(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
      setShowMobileMenu(false);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const closeMobileMenu = () => setShowMobileMenu(false);

  return (
    <header className="header">
      {/* TOPBAR */}
      <div className="header-topbar">
        <div className="topbar-container">
          <span className="topbar-shipping">
            <FaLeaf className="topbar-leaf" /> Envíos a todo México
          </span>
          <span className="topbar-slogan desktop-only">
            🌾 Del campo para el campo — Tu mercado agrícola de confianza
          </span>
        </div>
      </div>

      {/* MAIN BAR */}
      <div className="header-main-bar">
        <div className="header-container">
          <Link to="/" className="logo">
            <FaLeaf className="logo-leaf" /> MerkaAgro
          </Link>

          {/* DESKTOP: categorías */}
          <div className="categories-dropdown desktop-only">
            <button className="categories-btn" onClick={() => setShowCategories(!showCategories)}>
              <FaBars className="menu-icon" /> Categorías
              <FaChevronDown className={`chevron ${showCategories ? "open" : ""}`} />
            </button>
            {showCategories && (
              <div className="categories-menu">
                {CATEGORIAS_CON_EMOJI.map((cat) => (
                  <button key={cat} className="category-item" onClick={() => handleCategorySelect(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BÚSQUEDA */}
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Buscar productos, categorías..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" aria-label="Buscar">
              <FaSearch />
            </button>
          </form>

          {/* DESKTOP: nav */}
          <nav className="nav-links desktop-only">
            {user ? (
              <>
                <Link to="/mis-productos" className="nav-link">
                  <FaBox /> <span>Mis productos</span>
                </Link>
                <Link to="/mensajes" className="nav-link">
                  <FaEnvelope /> <span>Mensajes</span>
                </Link>
                <div className="user-menu">
                  <button className="user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                    <FaUser /> {user.email?.split("@")[0]}
                    <FaChevronDown className={`chevron ${showUserMenu ? "open" : ""}`} />
                  </button>
                  {showUserMenu && (
                    <div className="user-dropdown">
                      <Link to="/perfil" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        <FaUser /> Mi perfil
                      </Link>
                      <Link to="/nuevo-producto" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        + Publicar producto
                      </Link>
                      <button className="dropdown-item logout" onClick={handleLogout}>
                        <FaSignOutAlt /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
                <Link to="/" className="cart-link" aria-label="Carrito">
                  <FaShoppingCart />
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Iniciar sesión</Link>
                <Link to="/register" className="nav-link btn-register">Registrarse</Link>
              </>
            )}
          </nav>

          {/* MOBILE: hamburger */}
          <button
            className="hamburger-btn mobile-only"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menú"
          >
            {showMobileMenu ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {showMobileMenu && (
        <div className="mobile-overlay" onClick={closeMobileMenu}>
          <nav className="mobile-nav" onClick={e => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <span className="mobile-nav-title">Menú</span>
              <button className="mobile-nav-close" onClick={closeMobileMenu}><FaTimes /></button>
            </div>

            <div className="mobile-nav-links">
              {user ? (
                <>
                  <div className="mobile-user-info">
                    <FaUser />
                    <span>{user.email?.split("@")[0]}</span>
                  </div>
                  <Link to="/mis-productos" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <FaBox /> Mis productos
                  </Link>
                  <Link to="/mensajes" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <FaEnvelope /> Mensajes
                  </Link>
                  <Link to="/perfil" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <FaUser /> Mi perfil
                  </Link>
                  <Link to="/nuevo-producto" className="mobile-nav-link publish" onClick={closeMobileMenu}>
                    + Publicar producto
                  </Link>
                  <button className="mobile-nav-link logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-nav-link" onClick={closeMobileMenu}>
                    Iniciar sesión
                  </Link>
                  <Link to="/register" className="mobile-nav-link register" onClick={closeMobileMenu}>
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            <div className="mobile-categories">
              <p className="mobile-categories-title">Categorías</p>
              <div className="mobile-categories-list">
                {CATEGORIAS_CON_EMOJI.map((cat) => (
                  <button key={cat} className="mobile-category-item" onClick={() => handleCategorySelect(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
