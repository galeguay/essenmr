import { Outlet, Navigate } from "react-router-dom";
import { pb } from '../lib/pocketbase';
import Sidebar from '../pages/admin/Sidebar';
import { useEffect } from 'react';

export default function AdminLayout({ title = "Admin" }) {

  useEffect(() => {
    document.title = `${title}`;
  }, [title]);

  if (!pb.authStore.isValid) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
        <Sidebar title={title} />
        <div className="bg-gray-100 text-black dark:bg- dark:text-gray-400 lg:ms-14 2xl:ms-64 mt-12">
            <Outlet />
        </div>
    </div>
  );
}