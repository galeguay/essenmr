import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "../../lib/supabase";

export default function Sidebar({
    navTitle,
    children
}) {
    const navigate = useNavigate();

    const links = [
        { text: 'Productos', to: '/admin/products', icon: 'bi-box' },
        { text: 'Líneas de productos', to: '/admin/productLines', icon: 'bi-boxes' },
        { text: 'Promociones financieras', to: '/admin/promotions', icon: 'bi-credit-card' },
        { text: 'Preguntas Frecuentes', to: '/admin/faq', icon: 'bi-question-circle' },
    ];

    async function handleLogout() {
        await supabase.auth.signOut();
        navigate("/admin/login");
    }

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" defaultChecked />
            <div className="drawer-content">
                {/* Navbar */}
                <nav className="w-full text-white bg-gray-800 navbar">
                    <label htmlFor="my-drawer-4" aria-label="open sidebar" className="text-xl btn btn-square btn-ghost lg:hidden">
                        {/* Sidebar toggle icon */}
                        <i className="bi bi-list"></i>
                    </label>
                    <div className="px-4">{navTitle}</div>
                </nav>
                {/* Page content here */}
                <div>{children}</div>
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="flex flex-col items-start justify-between min-h-full pt-4 pb-8 text-white bg-black is-drawer-close:w-14 is-drawer-open:w-64">

                    <label htmlFor="my-drawer-4" aria-label="open sidebar" className="text-xl ms-2 btn btn-square btn-ghost ">
                        {/* Sidebar toggle icon */}
                        <i className="bi bi-list"></i>
                    </label>
                    {/* Sidebar content here */}
                    <ul className="w-full mt-4 menu grow">
                        {links.map((link) => (
                            <Link
                                to={link.to}>
                                <li key={link.text}>
                                    <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right hover:bg-gray-600" data-tip={link.text}>
                                        <i className={`bi ${link.icon}`}></i>
                                        <span className="is-drawer-close:hidden">{link.text}</span>
                                    </button>
                                </li>
                            </Link>
                        ))}
                    </ul>

                    <ul className="flex flex-col justify-end w-full menu grow">
                        <Link
                            to="/admin/settings">
                            <li>
                                <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right hover:bg-gray-600" data-tip="Configuración">
                                    <i className={`bi bi-gear-fill`}></i>
                                    <span className="is-drawer-close:hidden">Configuración</span>
                                </button>
                            </li>
                        </Link>

                        <li>
                            <button
                                onClick={handleLogout}
                                className="is-drawer-close:tooltip is-drawer-close:tooltip-right hover:bg-gray-600"
                                data-tip="Cerrar sesión"
                            >
                                <i className="bi bi-box-arrow-right"></i>
                                <span className="is-drawer-close:hidden">Cerrar sesión</span>
                            </button>
                        </li>
                    </ul>

                </div>
            </div>
        </div>)
}