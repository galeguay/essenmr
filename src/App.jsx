import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import RootLayout from "./routes/RootLayout";

import Login from "./pages/admin/Login";
import Products from "./pages/admin/Products";
import ProductLineForm from "./pages/admin/ProductLineForm";
import ProductForm from "./pages/admin/ProductForm";
import ProductLines from "./pages/admin/ProductLines";
import PromotionsForm from "./pages/admin/PromotionsForm";
import FaqForm from "./pages/admin/FaqForm";

import ProductDetail from "./pages/public/ProductDetail";
import Home from "./pages/public/Home";
import Catalog from "./pages/public/Catalog";
import FaqList from "./pages/public/FaqList";
import Settings from "./pages/admin/Settings";
import AboutMe from "./pages/public/AboutMe";


export default function App() {

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", "light");
    }, []);

    return (
        <Routes>
            <Route element={<RootLayout />}>

                {/* RUTAS PÚBLICAS */}
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/productos/:essen_id" element={<ProductDetail />} />
                <Route path="/faq" element={<FaqList />} />
                <Route path="/about_me" element={<AboutMe />} />

                {/* RUTAS ADMIN */}
                <Route path="/admin/*" element={<div className="text-4xl">Panel Admin</div>} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/products" element={<Products />} />
                <Route path="/admin/promotions" element={<PromotionsForm />} />
                <Route path="/admin/faq" element={<FaqForm />} />
                <Route path="/admin/products/new" element={<ProductForm />} />
                <Route path="/admin/products/:id" element={<ProductForm />} />
                <Route path="/admin/productLines" element={<ProductLines />} />
                <Route path="/admin/productLines/new" element={<ProductLineForm />} />
                <Route path="/admin/productLines/:id" element={<ProductLineForm />} />
                <Route path="/admin/settings" element={<Settings />} />

            </Route>
        </Routes>
    );
}
