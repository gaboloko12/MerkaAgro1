import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaChevronDown, FaSignOutAlt, FaBox, FaEnvelope, FaUser } from "react-icons/fa";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "../styles/header.css";

const CATEGORIAS = [
  "Maquinaria 🚜",
  "Semillas 🌱",
  "Cosechas 🥕",
  "Servicios 🧰",
  "Fertilizantes 💧",
  "Control de Plagas 🐛",
  "Sistemas de Riego 💦",
  "Alimentos 🍎",
  "Herramientas 🔧",
  "Insumos 📦",
  "Transporte 🚚",
  "Ganado y Animales 🐄",
  "Tierras y Terrenos 🌾",
  "Refacciones ⚙️",
  "Tecnología Agrícola 💻",
  "Consultoría Agrícola 🧑‍🌾",
  "Energía Solar ☀️",
  "Productos Orgánicos 🍃",
  "Invernaderos 🏭",
  "Agroinsumos 🧪",
  "Forrajes y Pastos 🌿",
];

export default function Header() {
  const [search, setSearch] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Obtener usuario autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
      if (!event.target.closest('.categories-dropdown')) {
        setShowCategories(false);
      }
    };

    if (showUserMenu || showCategories) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu, showCategories]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search)}`);
      setSearch("");
    }
  };

  const handleCategorySelect = (categoria) => {
    // Extrae solo el texto sin emoji: "Maquinaria 🚜" → "maquinaria"
    const categoriaLimpia = categoria.replace(/\s+[^\s]*$/, "").toLowerCase().trim();
    navigate(`/?categoria=${encodeURIComponent(categoriaLimpia)}`);
    setShowCategories(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          MerkaAgro
        </Link>

        {/* CATEGORÍAS DESPLEGABLE */}
        <div className="categories-dropdown">
          <button
            className="categories-btn"
            onClick={() => setShowCategories(!showCategories)}
          >
            Categorías
            <FaChevronDown className={`chevron ${showCategories ? "open" : ""}`} />
          </button>
          {showCategories && (
            <div className="categories-menu">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  className="category-item"
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </form>

        <nav className="nav-links">
          {user ? (
            // Usuario autenticado
            <>
              <Link to="/mis-productos" className="nav-link">
                <FaBox /> Mis productos
              </Link>
              <Link to="/mensajes" className="nav-link">
                <FaEnvelope /> Mensajes
              </Link>
              
              {/* MENÚ DE USUARIO */}
              <div className="user-menu">
                <button
                  className="user-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
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
            </>
          ) : (
            // Usuario no autenticado
            <>
              <Link to="/login" className="nav-link">Iniciar sesión</Link>
              <Link to="/register" className="nav-link btn-register">Registrarse</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
