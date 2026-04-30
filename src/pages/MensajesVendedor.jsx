import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import "../styles/mensajes.css";

export default function MensajesVendedor() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchMensajes = async () => {
      try {
        const q = query(
          collection(db, "mensajes"),
          where("vendedorId", "==", user.uid),
          orderBy("fechaCreacion", "desc")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
        }));

        setMensajes(data);
      } catch (error) {
        console.error("Error cargando mensajes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMensajes();
  }, [user]);

  const marcarComoLeido = async (mensajeId) => {
    try {
      const mensajeRef = doc(db, "mensajes", mensajeId);
      await updateDoc(mensajeRef, { leido: true });
      
      setMensajes(prev => 
        prev.map(m => m.id === mensajeId ? { ...m, leido: true } : m)
      );
    } catch (error) {
      console.error("Error al marcar como leído:", error);
    }
  };

  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const diff = ahora - fecha;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return fecha.toLocaleDateString();
  };

  if (loading) {
    return (
      <main className="mensajes-container">
        <p className="loading">Cargando mensajes...</p>
      </main>
    );
  }

  return (
    <main className="mensajes-container">
      <div className="mensajes-header">
        <h1>Mis Mensajes</h1>
        <p>{mensajes.length} mensaje{mensajes.length !== 1 ? 's' : ''} recibido{mensajes.length !== 1 ? 's' : ''}</p>
      </div>

      {mensajes.length === 0 ? (
        <div className="empty-state">
          <p>No tienes mensajes aún</p>
        </div>
      ) : (
        <div className="mensajes-list">
          {mensajes.map(mensaje => (
            <div
              key={mensaje.id}
              className={`mensaje-card ${!mensaje.leido ? "no-leido" : ""}`}
              onClick={() => !mensaje.leido && marcarComoLeido(mensaje.id)}
            >
              <div className="mensaje-header">
                <div>
                  <span className="mensaje-cliente">
                    {mensaje.clienteNombre}
                    {!mensaje.leido && <span className="badge-nuevo"> NUEVO</span>}
                  </span>
                  <p className="mensaje-producto">
                    📦 Producto: {mensaje.productoNombre}
                  </p>
                </div>
                <span className="mensaje-fecha">
                  {formatearFecha(mensaje.fechaCreacion)}
                </span>
              </div>

              <p className="mensaje-texto">{mensaje.mensaje}</p>

              <div className="mensaje-contacto">
                <span>📧 {mensaje.clienteEmail}</span>
                {mensaje.clienteTelefono && (
                  <span>
                    📞 <a href={`tel:${mensaje.clienteTelefono}`}>{mensaje.clienteTelefono}</a>
                  </span>
                )}
                {mensaje.clienteTelefono && (
                  <span>
                    💬 <a 
                      href={`https://wa.me/${mensaje.clienteTelefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, soy vendedor de MerkaAgro. Vi tu mensaje sobre: ${mensaje.productoNombre}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
