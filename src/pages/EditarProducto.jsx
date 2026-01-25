import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaUpload, FaTrash } from "react-icons/fa";
import "../styles/nuevo-producto.css";

const CATEGORIAS = [
  "maquinaria",
  "semillas",
  "cosechas",
  "servicios",
  "fertilizantes",
  "plagas",
  "riego",
  "alimentos",
  "herramientas",
  "insumos",
  "transporte",
  "animales",
  "tierras",
  "refacciones",
  "tecnología",
  "consultoría agrícola",
  "energía solar",
  "productos orgánicos",
  "invernaderos",
  "agroinsumos",
  "forrajes",
];

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    ubicacion: "",
    contacto: "",
    email: "",
  });

  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]);
  const [precioNegociable, setPrecioNegociable] = useState(false);
  const [envioMexico, setEnvioMexico] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "productos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Verificar que el usuario sea el creador
          if (data.creadoPor !== user.uid) {
            setError("No tienes permiso para editar este producto");
            setTimeout(() => navigate("/mis-productos"), 2000);
            return;
          }

          setFormData({
            nombre: data.nombre || "",
            descripcion: data.descripcion || "",
            precio: data.precio || "",
            categoria: data.categoria || "",
            ubicacion: data.ubicacion || "",
            contacto: data.contacto || "",
            email: data.email || "",
          });
          setImagenesExistentes(data.imagenes || []);
          setPrecioNegociable(data.precioNegociable || false);
          setEnvioMexico(data.envioMexico || false);
        } else {
          setError("Producto no encontrado");
          setTimeout(() => navigate("/mis-productos"), 2000);
        }
      } catch (error) {
        console.error("Error cargando producto:", error);
        setError("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImagenes = imagenesExistentes.length + imagenesNuevas.length + files.length;
    
    if (totalImagenes > 5) {
      setError("Máximo 5 imágenes permitidas");
      return;
    }
    setImagenesNuevas(prev => [...prev, ...files]);
  };

  const removeImagenExistente = (index) => {
    setImagenesExistentes(prev => prev.filter((_, i) => i !== index));
  };

  const removeImagenNueva = (index) => {
    setImagenesNuevas(prev => prev.filter((_, i) => i !== index));
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

    if (imagenesExistentes.length + imagenesNuevas.length === 0) {
      setError("Debes tener al menos una imagen");
      return;
    }

    setCargando(true);

    try {
      // Subir nuevas imágenes
      const imagenesUrls = [...imagenesExistentes];
      for (const img of imagenesNuevas) {
        const imageRef = ref(storage, `productos/${Date.now()}_${img.name}`);
        await uploadBytes(imageRef, img);
        const url = await getDownloadURL(imageRef);
        imagenesUrls.push(url);
      }

      // Actualizar producto en Firestore
      const docRef = doc(db, "productos", id);
      await updateDoc(docRef, {
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
        actualizadoEn: serverTimestamp(),
      });

      navigate("/mis-productos");
    } catch (err) {
      console.error("Error:", err);
      setError("Error al actualizar el producto: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  if (loading) {
    return (
      <main className="nuevo-producto-container">
        <p className="loading">Cargando producto...</p>
      </main>
    );
  }

  return (
    <main className="nuevo-producto-container">
      <div className="form-wrapper">
        <h1>Editar producto</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre del producto *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Tractor John Deere 5055E"
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe las características del producto..."
            />
          </div>

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
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="precio">Precio</label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              disabled={precioNegociable}
              placeholder="Ej: 150000"
            />
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="precioNegociable"
                checked={precioNegociable}
                onChange={(e) => setPrecioNegociable(e.target.checked)}
              />
              <label htmlFor="precioNegociable">Precio a consultar</label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ubicacion">Ubicación *</label>
            <input
              type="text"
              id="ubicacion"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              required
              placeholder="Ej: Guadalajara, Jalisco"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contacto">Teléfono de contacto</label>
            <input
              type="tel"
              id="contacto"
              name="contacto"
              value={formData.contacto}
              onChange={handleChange}
              placeholder="Ej: 3312345678"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email de contacto</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: contacto@ejemplo.com"
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
          <div className="form-group">
            <label>Imágenes del producto (máx. 5)</label>
            <div className="images-upload">
              <p>Imágenes actuales: {imagenesExistentes.length} | Nuevas: {imagenesNuevas.length}</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: "none" }}
                id="image-upload"
              />
              <label htmlFor="image-upload" className="upload-btn">
                <FaUpload /> Agregar más imágenes
              </label>
            </div>

            {imagenesExistentes.length > 0 && (
              <div>
                <h4>Imágenes actuales:</h4>
                <div className="images-preview">
                  {imagenesExistentes.map((url, index) => (
                    <div key={index} className="image-preview">
                      <img src={url} alt={`Imagen ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImagenExistente(index)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {imagenesNuevas.length > 0 && (
              <div>
                <h4>Imágenes nuevas:</h4>
                <div className="images-preview">
                  {imagenesNuevas.map((file, index) => (
                    <div key={index} className="image-preview">
                      <img src={URL.createObjectURL(file)} alt={`Nueva ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImagenNueva(index)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={cargando}
            >
              {cargando ? "Actualizando..." : "Actualizar producto"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/mis-productos")}
              disabled={cargando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
