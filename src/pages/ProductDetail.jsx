import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getCategoriaConEmoji } from "../utils/categoriaMapper";
import ContactModal from "../components/ContactModal";
import { Helmet } from "react-helmet-async";
import { FaPhone, FaWhatsapp, FaChevronLeft, FaChevronRight, FaTimes, FaSearchPlus } from "react-icons/fa";
import "../styles/ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const ref = doc(db, "productos", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setProduct(data);
        }
      } catch (error) {
        console.error("Error cargando producto:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const images = product?.imagenes || [];
  const activeImage = images[activeImageIndex] || "https://via.placeholder.com/600x400?text=Sin+Imagen";

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  // Cerrar lightbox con tecla Escape
  useEffect(() => {
    if (!showLightbox) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowLightbox(false);
      if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev + 1) % images.length);
      if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLightbox, images.length]);

  if (loading) return <p className="loading">Cargando producto...</p>;
  if (!product) return <p className="error">Producto no encontrado</p>;

  const metaDescription = product.descripcion?.slice(0, 155) || `${product.nombre} disponible en MerkaAgro. Marketplace de productos agrícolas en México.`;
  const metaImage = product.imagenes?.[0] || "https://www.merkaagro.com/logo-og.png";
  const canonicalUrl = `https://www.merkaagro.com/producto/${id}`;

  return (
    <>
      <Helmet>
        <title>{product.nombre} | MerkaAgro</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.nombre} | MerkaAgro`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:title" content={`${product.nombre} | MerkaAgro`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
      </Helmet>

      {/* NOMBRE DEL PRODUCTO - Fijo debajo del header */}
      <div className="product-title-bar">
        <div className="product-title-container">
          <h1 className="product-title-fixed">{product.nombre}</h1>
        </div>
      </div>

      <div className="product-detail">
        {/* GALERÍA */}
        <div className="gallery">
          <div className="main-image-container">
            <img
              src={activeImage}
              alt={product.nombre}
              className="main-image"
              onClick={() => openLightbox(activeImageIndex)}
            />
            
            {/* Botón de zoom */}
            <button 
              className="zoom-btn"
              onClick={() => openLightbox(activeImageIndex)}
              title="Ver en pantalla completa"
            >
              <FaSearchPlus />
            </button>

            {/* Flechas de navegación */}
            {images.length > 1 && (
              <>
                <button className="nav-btn prev" onClick={prevImage}>
                  <FaChevronLeft />
                </button>
                <button className="nav-btn next" onClick={nextImage}>
                  <FaChevronRight />
                </button>
                
                {/* Indicador de imagen */}
                <div className="image-counter">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Imagen ${index + 1}`}
                  onClick={() => setActiveImageIndex(index)}
                  className={index === activeImageIndex ? "active" : ""}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/120x120?text=Sin+Imagen";
                  }}
                />
              ))}
            </div>
          )}
        </div>

      {/* INFO */}
      <div className="info">
        {product.categoria && (
          <p className="categoria-detail">{getCategoriaConEmoji(product.categoria)}</p>
        )}

        {product.precio > 0 ? (
          <p className="price">${product.precio.toLocaleString()}</p>
        ) : (
          <a 
            href={`https://wa.me/${product.contacto?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vengo de MerkaAgro y me interesa tu producto: ${product.nombre}. ¿Cuál es el precio?`)}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="consulta-precio-btn"
          >
            <FaWhatsapp /> Consulta el precio
          </a>
        )}

        {product.ubicacion && (
          <p className="location">📍 {product.ubicacion}</p>
        )}

        {product.envioMexico && (
          <div className="envio-badge">
            🚚 Envío disponible a toda la República Mexicana
          </div>
        )}

        {/* DESCRIPCIÓN CON VER MÁS */}
        {product.descripcion && (() => {
          const lines = product.descripcion.split('\n').length;
          const isLong = lines > 7 || product.descripcion.length > 480;
          return (
            <div className="description-section">
              <h3>Descripción</h3>
              <p className={`description${isLong && !showFullDescription ? ' description-collapsed' : ''}`}>
                {product.descripcion}
              </p>
              {isLong && (
                <button
                  className="btn-ver-mas"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          );
        })()}

        {/* CONTACTO DEL VENDEDOR */}
        {product.contacto && (
          <div className="seller-contact">
            <h3>Contacto del vendedor</h3>
            <a href={`tel:${product.contacto}`} className="contact-btn phone">
              <FaPhone /> {product.contacto}
            </a>
            <a href={`https://wa.me/${product.contacto.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vengo de MerkaAgro y me interesa tu producto: ${product.nombre}`)}`} target="_blank" rel="noopener noreferrer" className="contact-btn whatsapp">
              <FaWhatsapp /> WhatsApp
            </a>
          </div>
        )}

        <div className="actions">
          <button
            className="primary"
            onClick={() => setShowContactModal(true)}
          >
            Contactar vendedor
          </button>
        </div>
      </div>

      </div>

      {/* LIGHTBOX */}
      {showLightbox && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <FaTimes />
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[lightboxIndex]} 
              alt={`Imagen ${lightboxIndex + 1}`}
              className="lightbox-image"
            />

            {images.length > 1 && (
              <>
                <button className="lightbox-nav prev" onClick={prevLightboxImage}>
                  <FaChevronLeft />
                </button>
                <button className="lightbox-nav next" onClick={nextLightboxImage}>
                  <FaChevronRight />
                </button>
                
                <div className="lightbox-counter">
                  {lightboxIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        seller={product?.vendedor || { id: product?.creadoPor, nombre: "Vendedor" }}
        productId={id}
        productName={product?.nombre}
      />
    </>
  );
}
