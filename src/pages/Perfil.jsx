import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, updateProfile, updateEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import "../styles/perfil.css";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        setFormData({
          displayName: currentUser.displayName || "",
          email: currentUser.email || "",
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setGuardando(true);

    try {
      // Actualizar nombre si cambió
      if (formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName,
        });
      }

      // Actualizar email si cambió (requiere reautenticación reciente)
      if (formData.email !== user.email) {
        try {
          await updateEmail(user, formData.email);
        } catch (emailError) {
          if (emailError.code === "auth/requires-recent-login") {
            setError("Para cambiar el email necesitas volver a iniciar sesión");
          } else {
            throw emailError;
          }
        }
      }

      setMensaje("✅ Perfil actualizado correctamente");
      
      // Recargar usuario para obtener los datos actualizados
      await user.reload();
      setUser(auth.currentUser);
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      setError("Error al actualizar el perfil: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <main className="perfil-container">
        <p className="loading">Cargando perfil...</p>
      </main>
    );
  }

  return (
    <main className="perfil-container">
      <div className="perfil-card">
        <div className="perfil-header">
          <div className="perfil-avatar">
            <FaUser />
          </div>
          <h1>{user.displayName || "Usuario"}</h1>
          <p>{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="perfil-form">
          {error && (
            <div className="message error">
              {error}
            </div>
          )}
          
          {mensaje && (
            <div className="message success">
              {mensaje}
            </div>
          )}

          <div className="perfil-info">
            <div className="info-group">
              <label htmlFor="displayName">Nombre para mostrar</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Tu nombre"
              />
            </div>

            <div className="info-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
              />
              <small style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                Cambiar el email requiere que hayas iniciado sesión recientemente
              </small>
            </div>

            <div className="info-group">
              <label>ID de usuario</label>
              <input
                type="text"
                value={user.uid}
                disabled
                style={{ background: "#f3f4f6", cursor: "not-allowed" }}
              />
            </div>

            <div className="info-group">
              <label>Fecha de registro</label>
              <input
                type="text"
                value={new Date(user.metadata.creationTime).toLocaleDateString("es-ES")}
                disabled
                style={{ background: "#f3f4f6", cursor: "not-allowed" }}
              />
            </div>
          </div>

          <div className="perfil-actions">
            <button
              type="submit"
              className="btn-guardar"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
