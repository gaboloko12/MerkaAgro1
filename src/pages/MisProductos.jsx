import { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaTrash, FaEdit } from "react-icons/fa";
import "../styles/mis-productos.css";

export default function MisProductos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
    if (!user) return;

    const fetchMyProducts = async () => {
      try {
        console.log("Buscando productos para UID:", user.uid);
        const q = query(
          collection(db, "productos"),
          where("creadoPor", "==", user.uid)
        );

        const snapshot = await getDocs(q);
        console.log("Productos encontrados:", snapshot.docs.length);
        
        const data = snapshot.docs.map(doc => {
          console.log("Producto:", doc.id, doc.data());
          return {
            id: doc.id,
            ...doc.data(),
          };
        });

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
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, "productos", productId));
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error("Error eliminando producto:", error);
      }
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
                    >
                      <FaTrash /> Eliminar
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
