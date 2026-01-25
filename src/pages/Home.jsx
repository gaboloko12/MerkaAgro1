import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "../styles/products.css";

// Función para mezclar array aleatoriamente
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
  
  const searchQuery = searchParams.get("search") || "";
  const categoriaQuery = searchParams.get("categoria") || "";

  // Guardar búsquedas en localStorage para recomendaciones
  useEffect(() => {
    if (categoriaQuery) {
      const historial = JSON.parse(localStorage.getItem("categorias_vistas") || "[]");
      if (!historial.includes(categoriaQuery)) {
        historial.push(categoriaQuery);
        if (historial.length > 5) historial.shift(); // Mantener últimas 5
        localStorage.setItem("categorias_vistas", JSON.stringify(historial));
      }
    }
  }, [categoriaQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "productos"),
          orderBy("nombre")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Mezclar productos aleatoriamente
        const shuffledData = shuffleArray(data);
        setProducts(shuffledData);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategoria = !categoriaQuery || p.categoria?.toLowerCase() === categoriaQuery.toLowerCase();
    return matchSearch && matchCategoria;
  });

  // Productos destacados
  const destacados = products.filter(p => p.destacado === true).slice(0, 6);

  // Productos recomendados basados en búsquedas anteriores
  const historialCategorias = JSON.parse(localStorage.getItem("categorias_vistas") || "[]");
  const recomendados = products
    .filter(p => 
      historialCategorias.some(cat => p.categoria?.toLowerCase() === cat.toLowerCase()) &&
      !destacados.find(d => d.id === p.id)
    )
    .slice(0, 6);

  // Si hay búsqueda activa, mostrar resultados
  if (searchQuery || categoriaQuery) {
    return (
      <main className="container">
        {/* HEADER DE FILTROS */}
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

  // Vista principal sin búsqueda
  return (
    <main className="container home-main">
      {loading ? (
        <p className="loading">Cargando productos...</p>
      ) : (
        <>
          {/* PRODUCTOS RECOMENDADOS */}
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

          {/* TODOS LOS PRODUCTOS */}
          <section className="section-todos">
            <div className="section-header">
              <h2>Todos los productos</h2>
              <p className="section-subtitle">Explora nuestro catálogo completo</p>
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
        </>
      )}
    </main>
  );
}
