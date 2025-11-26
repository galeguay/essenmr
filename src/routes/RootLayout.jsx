import { Outlet, useLocation } from "react-router-dom";
import PublicLayout from "./PublicLayout";
import AdminLayout from "./AdminLayout";

export default function RootLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin") && location.pathname !== "/admin/login";

  return isAdmin ? <AdminLayout /> : <PublicLayout />;
  // El <Outlet /> se renderiza dentro de PublicLayout o AdminLayout
}