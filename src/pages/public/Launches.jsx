import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Seo from "../../components/Seo";
import Promotions from "../../components/Promotions";
import LaunchShowcase from "../../components/LaunchShowcase";
import { hasLaunchMedia } from "../../utils/launchMedia";
import { toTitleCase } from "../../utils/toTitleCase";
import { typography } from "../../styles/typography";

export default function Launches() {
    const { essen_id } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [essen_id]);

    useEffect(() => {
        const fetchLaunches = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from("products")
                    .select(`*, product_line (*)`)
                    .eq("is_visible", true)
                    .order("id", { ascending: false });

                // Con código: se muestra ese producto (aunque ya no sea "nuevo"), ideal para compartir
                query = essen_id ? query.eq("essen_id", essen_id) : query.eq("is_new", true);

                const { data, error } = await query;
                if (error) throw error;

                setProducts((data || []).filter(hasLaunchMedia));
            } catch (err) {
                console.error("Error cargando lanzamientos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLaunches();
    }, [essen_id]);

    useEffect(() => {
        if (loading || !window.location.hash) return;
        const timer = setTimeout(() => {
            document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth" });
        }, 300);
        return () => clearTimeout(timer);
    }, [loading]);

    const single = essen_id ? products[0] : null;

    return (
        <>
            <Seo
                title={single ? `${toTitleCase(single.name)} – Lanzamiento | EssenMR` : "Lanzamientos Essen – Fichas y videos | EssenMR"}
                description={
                    single?.description ||
                    "Conocé los nuevos productos Essen: mirá los videos y las fichas técnicas de cada lanzamiento. EssenMR, Mar del Plata, envíos a todo el país."
                }
                image={single?.image}
                canonical={essen_id ? `/lanzamientos/${essen_id}` : "/lanzamientos"}
                keywords="Essen, lanzamientos, nuevos productos, ficha técnica, videos, Mar del Plata"
            />

            <section className="py-10 border-b md:py-14 bg-orange-50 border-orange-100">
                <div className="container px-6 mx-auto md:px-16">
                    <p className="mb-2 text-sm font-semibold tracking-widest text-orange-700 uppercase">
                        <i className="bi bi-stars me-1"></i> Lo nuevo de Essen
                    </p>
                    <h1 className={`${typography.sectionTitle} text-orange-900`}>Lanzamientos</h1>
                    <p className="max-w-2xl mt-3 text-orange-900/80 md:text-lg">
                        Mirá cada producto nuevo en video y revisá su ficha con medidas, materiales y modos de uso.
                    </p>

                    {!essen_id && products.length > 1 && (
                        <nav aria-label="Lanzamientos" className="flex gap-2 pb-2 mt-6 -mx-6 overflow-x-auto scrollbar-visible px-6 md:mx-0 md:px-0 md:flex-wrap">
                            {products.map((p) => (
                                <a
                                    key={p.id}
                                    href={`#p-${p.essen_id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById(`p-${p.essen_id}`)?.scrollIntoView({ behavior: "smooth" });
                                        history.replaceState(null, "", `#p-${p.essen_id}`);
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-orange-800 bg-white border border-orange-200 rounded-full shrink-0 whitespace-nowrap hover:border-orange-500"
                                >
                                    {toTitleCase(p.name)}
                                </a>
                            ))}
                        </nav>
                    )}
                </div>
            </section>

            {loading ? (
                <div className="flex items-center justify-center py-32 bg-stone-50">
                    <div className="w-16 h-16 border-t-4 border-b-4 border-orange-600 rounded-full animate-spin"></div>
                </div>
            ) : products.length === 0 ? (
                <section className="flex flex-col items-center gap-4 px-6 py-24 text-center bg-stone-50">
                    <i className="text-5xl text-orange-300 bi bi-box2-heart"></i>
                    <p className="text-xl text-gray-700">
                        {essen_id ? "Este lanzamiento no está disponible." : "Pronto vas a encontrar acá los próximos lanzamientos."}
                    </p>
                    <a href={essen_id ? "/lanzamientos" : "/catalogo"} className="font-semibold text-orange-700 underline">
                        {essen_id ? "Ver todos los lanzamientos" : "Ver el catálogo"}
                    </a>
                </section>
            ) : (
                products.map((product, index) => (
                    <section key={product.id} className={`py-12 md:py-16 ${index % 2 ? "bg-white" : "bg-stone-50"}`}>
                        <div className="container px-6 mx-auto md:px-16">
                            <LaunchShowcase product={product} />
                        </div>
                    </section>
                ))
            )}

            {essen_id && products.length > 0 && (
                <div className="flex justify-center py-8 bg-stone-50">
                    <a href="/lanzamientos" className="font-semibold text-orange-700 hover:text-orange-800">
                        ← Ver todos los lanzamientos
                    </a>
                </div>
            )}

            <Promotions />
        </>
    );
}
