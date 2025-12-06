import { Outlet } from "react-router-dom";
import Navbar from "../components/public/NavBar";
import Footer from "../components/public/Footer";

export default function PublicLayout() {

  const pathname = location.pathname;

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