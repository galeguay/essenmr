import { Routes, Route } from "react-router-dom";
import RootLayout from "./routes/RootLayout";
import Login from "./pages/admin/Login";
import Products from "./pages/admin/Products";
import ProductLineForm from "./pages/admin/ProductLineForm";
import ProductForm from "./pages/admin/ProductForm";
import ProductLines from "./pages/admin/ProductLines";
import ProductDetail from "./pages/public/ProductDetail";
import Home from "./pages/public/Home";
import Catalog from "./pages/public/Catalog";


export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />


        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/products/:essen_id" element={<ProductDetail />} />
        <Route path="/promociones" element={<div className="py-20 min-h-screen text-center text-4xl">Promociones (próximamente)</div>} />

        {/* RUTAS ADMIN */}
        <Route path="/admin/*" element={<div className="text-4xl">Panel Admin</div>} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/products/new" element={<ProductForm />} />
        <Route path="/admin/products/:id" element={<ProductForm />} />
        <Route path="/admin/productLines" element={<ProductLines />} />
        <Route path="/admin/productLines/new" element={<ProductLineForm />} />
        
      </Route>
    </Routes>
  );
}
