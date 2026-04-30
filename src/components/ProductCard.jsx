import { Link } from "react-router-dom";
import { useState } from "react";
import { getCategoriaConEmoji } from "../utils/categoriaMapper";
import "../styles/cards.css";

export default function ProductCard({ product }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(false);

  const imageSrc =
    product?.imagenes?.[0] && product.imagenes[0].trim() !== ""
      ? product.imagenes[0]
      : null;

  const handleImageLoad = () => setImageLoading(false);

  const handleImageError = (e) => {
    setImageError(true);
    setImageLoading(false);
    e.currentTarget.src = "https://via.placeholder.com/400x200?text=Sin+Imagen";
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(prev => !prev);
  };

  return (
    <Link to={`/producto/${product.id}`} className="product-card">
      <div className="image-container">
        {imageLoading && !imageError && (
          <div className="image-skeleton"></div>
        )}
        <img
          src={imageSrc || "https://via.placeholder.com/400x200?text=Sin+Imagen"}
          alt={product?.nombre || "Producto"}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={imageLoading ? "loading" : "loaded"}
        />
        <button
          className={`heart-btn${liked ? " liked" : ""}`}
          onClick={handleLike}
          aria-label="Guardar en favoritos"
        >
          {liked ? "♥" : "♡"}
        </button>
      </div>

      <div className="card-body">
        <h3>{product.nombre}</h3>
        <p className="categoria">{getCategoriaConEmoji(product.categoria)}</p>
        <p className="price">
          {product.precio === 0 || product.precioNegociable
            ? "Precio a consultar"
            : `$${product.precio?.toLocaleString()}`
          }
        </p>
        {product.envioMexico && (
          <p className="envio-badge-card">🚚 Envío disponible</p>
        )}
        <p className="location">📍 {product.ubicacion}</p>
      </div>

      {product.destacado && <span className="badge-star">⭐</span>}
    </Link>
  );
}
