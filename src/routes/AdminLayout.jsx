import { Outlet, Navigate } from "react-router-dom";
import { supabase } from '../lib/supabase';
import Sidebar from '../components/admin/Sidebar';
import { useEffect, useState } from 'react';

export default function AdminLayout({ title = "Admin" }) {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        document.title = title;
    }, [title]);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoggedIn(!!session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return null; // o un spinner si querés

    if (!loggedIn) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar title={title}>
                <div className="text-black bg-gray-100 lg:ms-14">
                    <Outlet />
                </div>
            </Sidebar>
        </div>
    );
}
