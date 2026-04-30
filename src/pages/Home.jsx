import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "../styles/products.css";

const MAIN_CATEGORIES = [
  { name: "Fertilizantes", key: "fertilizantes", icon: "💧" },
  { name: "Insumos", key: "insumos", icon: "📦" },
  { name: "Maquinaria", key: "maquinaria", icon: "🚜" },
  { name: "Semillas", key: "semillas", icon: "🌱" },
  { name: "Control de plagas", key: "plagas", icon: "🐛" },
  { name: "Riego", key: "riego", icon: "💦" },
  { name: "Herramientas", key: "herramientas", icon: "🔧" },
  { name: "Tierra y terrenos", key: "tierras", icon: "🌾" },
];

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("search") || "";
  const categoriaQuery = searchParams.get("categoria") || "";

  useEffect(() => {
    if (categoriaQuery) {
      const historial = JSON.parse(localStorage.getItem("categorias_vistas") || "[]");
      if (!historial.includes(categoriaQuery)) {
        historial.push(categoriaQuery);
        if (historial.length > 5) historial.shift();
        localStorage.setItem("categorias_vistas", JSON.stringify(historial));
      }
    }
  }, [categoriaQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "productos"), orderBy("nombre"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(shuffleArray(data));
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategoria =
      !categoriaQuery || p.categoria?.toLowerCase() === categoriaQuery.toLowerCase();
    return matchSearch && matchCategoria;
  });

  const destacados = products.filter(p => p.destacado === true).slice(0, 6);

  const historialCategorias = JSON.parse(localStorage.getItem("categorias_vistas") || "[]");
  const recomendados = products
    .filter(p =>
      historialCategorias.some(cat => p.categoria?.toLowerCase() === cat.toLowerCase()) &&
      !destacados.find(d => d.id === p.id)
    )
    .slice(0, 6);

  if (searchQuery || categoriaQuery) {
    return (
      <main className="container">
        <div className="filter-header">
          {searchQuery && (
            <p className="filter-text">
              Resultados para: <strong>"{searchQuery}"</strong>
            </p>
          )}
          {categoriaQuery && (
            <p className="filter-text">
              Categoría: <strong>{categoriaQuery}</strong>
            </p>
          )}
          {filteredProducts.length > 0 && (
            <p className="results-count">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {loading ? (
          <p className="loading">Cargando productos...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="no-products">No hay productos disponibles</p>
        ) : (
          <section className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </main>
    );
  }

  return (
    <main className="home-page">
      {/* HERO BANNER */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content">
            <h1 className="hero-title">Soluciones que impulsan tu campo</h1>
            <p className="hero-subtitle">
              Insumos, maquinaria y productos agrícolas<br />
              de calidad para mayores rendimientos.
            </p>
            <div className="hero-actions">
              <button
                className="hero-btn-primary"
                onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explorar catálogo ›
              </button>
              <Link to="/nuevo-producto" className="hero-btn-secondary">🌿 Vender en MerkaAgro</Link>
            </div>
            <div className="hero-badges">
              <div className="hero-badge">
                <span className="hero-badge-icon">🛡️</span>
                <div className="hero-badge-text">
                  <strong>Productos de calidad</strong>
                  <small>Seleccionados para ti</small>
                </div>
              </div>
              <div className="hero-badge">
                <span className="hero-badge-icon">🚚</span>
                <div className="hero-badge-text">
                  <strong>Envíos seguros</strong>
                  <small>A todo México</small>
                </div>
              </div>
              <div className="hero-badge">
                <span className="hero-badge-icon">🎧</span>
                <div className="hero-badge-text">
                  <strong>Asesoría especializada</strong>
                  <small>Estamos para ayudarte</small>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-image-side">
            {/* Reemplaza el src con la ruta de tu imagen, ej: "/tractor.jpg" */}
            {/* Sube tu foto a la carpeta public/ y pon el nombre aquí */}
            <img
              src="/hero-tractor.jpg"
              alt="Campo agrícola"
              className="hero-photo"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="hero-image-overlay"></div>
            <span className="hero-deco-leaf">🌿</span>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS BAR */}
      <section className="cat-bar-section">
        <div className="cat-bar-container">
          {MAIN_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className="cat-bar-item"
              onClick={() => navigate(`/?categoria=${cat.key}`)}
            >
              <span className="cat-bar-icon">{cat.icon}</span>
              <span className="cat-bar-name">{cat.name}</span>
            </button>
          ))}
          <button className="cat-bar-item cat-bar-all" onClick={() => navigate("/")}>
            <span className="cat-bar-icon">⊞</span>
            <span className="cat-bar-name">Ver todas</span>
          </button>
        </div>
      </section>

      {/* PRODUCTOS */}
      <div id="productos" className="container home-inner">
        {loading ? (
          <p className="loading">Cargando productos...</p>
        ) : (
          <div className="home-main">
            {recomendados.length > 0 && (
              <section className="section-recomendados">
                <div className="section-header">
                  <h2>Recomendado para ti</h2>
                  <p className="section-subtitle">Basado en tus búsquedas anteriores</p>
                </div>
                <div className="products-grid">
                  {recomendados.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            <section className="section-todos">
              <div className="section-header todos-header">
                <div>
                  <h2>Todos los productos</h2>
                  <p className="section-subtitle">Explora nuestro catálogo completo</p>
                </div>
                <Link to="/" className="ver-todos-link">Ver todos los productos ›</Link>
              </div>
              {products.length === 0 ? (
                <p className="no-products">No hay productos disponibles</p>
              ) : (
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
