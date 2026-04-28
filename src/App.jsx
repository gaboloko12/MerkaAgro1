import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MensajesVendedor from "./pages/MensajesVendedor";
import MisProductos from "./pages/MisProductos";
import NuevoProducto from "./pages/NuevoProducto";
import EditarProducto from "./pages/EditarProducto";
import Perfil from "./pages/Perfil";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/nuevo-producto" element={<ProtectedRoute><NuevoProducto /></ProtectedRoute>} />
          <Route path="/editar-producto/:id" element={<ProtectedRoute><EditarProducto /></ProtectedRoute>} />
          <Route path="/mis-productos" element={<ProtectedRoute><MisProductos /></ProtectedRoute>} />
          <Route path="/mensajes" element={<ProtectedRoute><MensajesVendedor /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
