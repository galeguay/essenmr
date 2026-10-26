import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

export default function PublicLayout() {

  const { pathname, hash } = useLocation();

  // Al cambiar de página se vuelve arriba (salvo que la URL apunte a una sección con #)
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  // Rutas donde NO querés mostrar navbar/footer
  const hiddenRoutes = [
    "/admin/login",
    "/admin/register",
    "/admin/recuperar",
  ];

    const hideNavBar = hiddenRoutes.includes(pathname);

  return (
    <>
      {!hideNavBar && <Navbar />}

      <main className={`${!hideNavBar && "mt-16"} min-h-screen`}>
          <Outlet />
      </main>

      {!hideNavBar && <Footer />}
    </>
  );
}