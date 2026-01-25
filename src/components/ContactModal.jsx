import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/modal.css";

export default function ContactModal({ isOpen, onClose, seller, productId, productName }) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Guardar en Firestore
      const mensajesRef = collection(db, "mensajes");
      await addDoc(mensajesRef, {
        vendedorId: seller?.id || "vendedor-desconocido",
        vendedorEmail: seller?.email || "",
        vendedorNombre: seller?.nombre || "Vendedor",
        productoId: productId,
        productoNombre: productName,
        clienteNombre: formData.nombre,
        clienteEmail: formData.email,
        clienteTelefono: formData.telefono,
        mensaje: formData.mensaje,
        leido: false,
        fechaCreacion: serverTimestamp(),
      });

      setMessage("✅ Mensaje enviado correctamente al vendedor!");
      setFormData({ nombre: "", email: "", telefono: "", mensaje: "" });

      // Cerrar después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      setMessage("❌ Error al enviar el mensaje. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2>Contactar vendedor</h2>

        {seller && (
          <div className="seller-info">
            <h3>{seller.nombre || "Vendedor"}</h3>
            {seller.telefono && (
              <p>
                <strong>📞 Teléfono:</strong>{" "}
                <a href={`tel:${seller.telefono}`}>{seller.telefono}</a>
              </p>
            )}
            {seller.email && (
              <p>
                <strong>📧 Email:</strong>{" "}
                <a href={`mailto:${seller.email}`}>{seller.email}</a>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="contact-form">
          {message && (
            <div className={`form-message ${message.includes("✅") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Tu nombre"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono:</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              placeholder="Tu teléfono"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mensaje">Mensaje:</label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      </div>
    </div>
  );
}
