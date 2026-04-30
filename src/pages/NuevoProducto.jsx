import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import { FaUpload, FaTrash } from "react-icons/fa";
import { CATEGORIAS } from "../utils/categorias";
import "../styles/nuevo-producto.css";

const MAX_IMAGEN_MB = 5;

export default function NuevoProducto() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    ubicacion: "",
    contacto: "",
    email: "",
  });

  const [imagenes, setImagenes] = useState([]);
  const [precioNegociable, setPrecioNegociable] = useState(false);
  const [envioMexico, setEnvioMexico] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imagenes.length + files.length > 5) {
      setError("Máximo 5 imágenes permitidas");
      return;
    }
    const sobrePeso = files.filter(f => f.size > MAX_IMAGEN_MB * 1024 * 1024);
    if (sobrePeso.length > 0) {
      setError(`Cada imagen debe pesar menos de ${MAX_IMAGEN_MB}MB`);
      return;
    }
    setImagenes(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.nombre || !formData.categoria || !formData.ubicacion) {
      setError("Completa los campos obligatorios");
      return;
    }

    if (!precioNegociable && !formData.precio) {
      setError("Ingresa un precio o marca como precio a consultar");
      return;
    }

    if (imagenes.length === 0) {
      setError("Agrega al menos una imagen");
      return;
    }

    if (!auth.currentUser) {
      setError("Debes estar autenticado");
      return;
    }

    setCargando(true);

    try {
      console.log("Usuario actual:", auth.currentUser.uid);
      // Subir imágenes
      const imagenesUrls = [];
      for (const img of imagenes) {
        const imageRef = ref(storage, `productos/${Date.now()}_${img.name}`);
        await uploadBytes(imageRef, img);
        const url = await getDownloadURL(imageRef);
        imagenesUrls.push(url);
      }

      // Crear producto en Firestore
      const docData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: precioNegociable ? 0 : Number(formData.precio),
        precioNegociable: precioNegociable,
        categoria: formData.categoria,
        ubicacion: formData.ubicacion,
        contacto: formData.contacto,
        email: formData.email,
        envioMexico: envioMexico,
        imagenes: imagenesUrls,
        creadoPor: auth.currentUser.uid,
        vendedor: {
          id: auth.currentUser.uid,
          nombre: auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "Vendedor",
          email: auth.currentUser.email || "",
          telefono: formData.contacto,
        },
        creadoEn: serverTimestamp(),
        destacado: false,
        recomendado: false,
      };
      
      console.log("Guardando producto:", docData);
      await addDoc(collection(db, "productos"), docData);

      navigate("/mis-productos");
    } catch (err) {
      console.error("Error:", err);
      setError("Error al crear el producto: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="nuevo-producto-container">
      <div className="form-wrapper">
        <h1>Crear nuevo producto</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* NOMBRE */}
          <div className="form-group">
            <label htmlFor="nombre">Nombre del producto *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Trilladora John Deere"
              required
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe tu producto..."
              rows="5"
            />
          </div>

          {/* PRECIO */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="precio">Precio {!precioNegociable && '*'}</label>
              <input
                type="number"
                id="precio"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                placeholder="0"
                required={!precioNegociable}
                min="0"
                disabled={precioNegociable}
              />
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="precioNegociable"
                  checked={precioNegociable}
                  onChange={(e) => {
                    setPrecioNegociable(e.target.checked);
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, precio: '' }));
                    }
                  }}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="precioNegociable" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem', color: '#059669' }}>
                  Precio a consultar / Negociable
                </label>
              </div>
            </div>

            {/* CATEGORÍA */}
            <div className="form-group">
              <label htmlFor="categoria">Categoría *</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* UBICACIÓN Y CONTACTO */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ubicacion">Ubicación *</label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Los Mochis, Sinaloa"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contacto">Teléfono / WhatsApp</label>
              <input
                type="tel"
                id="contacto"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                placeholder="Ej: 6681234567"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
            />
          </div>

          {/* ENVÍO A MÉXICO */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="envioMexico"
                checked={envioMexico}
                onChange={(e) => setEnvioMexico(e.target.checked)}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <label htmlFor="envioMexico" style={{ margin: 0, cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>
                🚚 Ofrezco envío a toda la República Mexicana
              </label>
            </div>
          </div>

          {/* IMÁGENES */}
          <div className="form-group">
            <label>Imágenes * (Máximo 5)</label>
            <div className="image-upload">
              <label className="upload-label">
                <FaUpload /> Selecciona imágenes
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {imagenes.length > 0 && (
              <div className="image-preview">
                <p className="preview-title">Imágenes seleccionadas: {imagenes.length}</p>
                <div className="preview-grid">
                  {imagenes.map((img, index) => (
                    <div key={index} className="preview-item">
                      <img src={URL.createObjectURL(img)} alt={`preview-${index}`} />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeImage(index)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BOTONES */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/mis-productos")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={cargando}
            >
              {cargando ? "Publicando..." : "Publicar producto"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
