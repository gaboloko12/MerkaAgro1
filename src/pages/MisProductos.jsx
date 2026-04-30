import { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { FaTrash, FaEdit } from "react-icons/fa";
import "../styles/mis-productos.css";

export default function MisProductos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchMyProducts = async () => {
      try {
        const q = query(
          collection(db, "productos"),
          where("creadoPor", "==", user.uid)
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, [user]);

  const handleDelete = async (productId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    setDeletingId(productId);
    try {
      await deleteDoc(doc(db, "productos", productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("No se pudo eliminar el producto. Intenta de nuevo.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="loading">Cargando tus productos...</p>;

  return (
    <main className="mis-productos-container">
      <div className="mis-productos-header">
        <h1>Mis Productos</h1>
        <button 
          className="btn-new-product"
          onClick={() => navigate("/nuevo-producto")}
        >
          + Agregar producto
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No tienes productos registrados</p>
          <button 
            className="btn-primary"
            onClick={() => navigate("/nuevo-producto")}
          >
            Crear mi primer producto
          </button>
        </div>
      ) : (
        <div className="productos-table">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td className="nombre">{product.nombre}</td>
                  <td>{product.categoria}</td>
                  <td>
                    {product.precioNegociable 
                      ? "A consultar" 
                      : `$${product.precio?.toLocaleString()}`
                    }
                  </td>
                  <td>{product.ubicacion}</td>
                  <td className="acciones">
                    <button 
                      className="btn-edit"
                      onClick={() => navigate(`/editar-producto/${product.id}`)}
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                    >
                      <FaTrash /> {deletingId === product.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
