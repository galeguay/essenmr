import { Outlet, Navigate } from "react-router-dom";
import { supabase } from '../lib/supabase';
import Sidebar from '../pages/admin/Sidebar';
import { useEffect, useState } from 'react';

export default function AdminLayout({ title = "Admin" }) {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setLoggedIn(!!session);
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) return null; // o un spinner si querés

  if (!loggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar title={title} />
      <div className="bg-gray-100 text-black lg:ms-14 2xl:ms-64 mt-12">
        <Outlet />
      </div>
    </div>
  );
}
