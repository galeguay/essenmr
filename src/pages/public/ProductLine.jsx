import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getLinePalette } from "../../utils/linePalette";
import ProductCard from "../../components/ProductCard";
import BtnWpp from "../../components/BtnWpp";
import Seo from "../../components/Seo";
import VerticalVideo from "../../components/VerticalVideo";

// Posición y giro de cada foto del encabezado para que se solapen
const HERO_SLOTS = [
    "left-0 top-0 -rotate-6 z-10",
    "right-0 top-4 md:top-8 rotate-6 z-10",
    "left-1/2 -translate-x-1/2 bottom-0 rotate-2 z-0",
];

export default function ProductLine() {
    const { string_id } = useParams();
    const [line, setLine] = useState(null);
    const [products, setProducts] = useState([]);
    const [heroProducts, setHeroProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data: lineData, error } = await supabase
                    .from("product_lines")
                    .select("*")
                    .eq("string_id", string_id)
                    .eq("is_visible", true)
                    .maybeSingle();

                if (error) throw error;
                setLine(lineData);

                if (lineData) {
                    const { data: productsData, error: prodError } = await supabase
                        .from("products")
                        .select("*, product_line (*)")
                        .eq("is_visible", true)
                        .eq("product_line", lineData.id)
                        .order("essen_id", { ascending: false });

                    if (prodError) throw prodError;

                    const priority = (p) => (p.is_new ? 0 : p.discount > 0 ? 1 : 2);
                    setProducts([...(productsData || [])].sort((a, b) => priority(a) - priority(b)));

                    // 3 productos al azar (con foto) para el encabezado
                    const withImage = (productsData || []).filter((p) => p.image);
                    for (let i = withImage.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [withImage[i], withImage[j]] = [withImage[j], withImage[i]];
                    }
                    setHeroProducts(withImage.slice(0, 3));
                }
            } catch (err) {
                console.error("Error cargando la línea:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [string_id]);

    const palette = useMemo(() => getLinePalette(line?.color), [line?.color]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-t-4 border-b-4 border-orange-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!line) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center bg-stone-50">
                <p className="text-xl text-gray-600">No encontramos esta línea de productos.</p>
                <Link to="/productos" className="btn btn-neutral">Ver todos los productos</Link>
            </div>
        );
    }

    const newCount = products.filter((p) => p.is_new).length;
    const discountCount = products.filter((p) => p.discount > 0).length;

    return (
        <>
            <Seo
                title={`${line.name} | EssenMR`}
                description={line.description || `Conocé la línea ${line.name} de Essen y todos sus productos.`}
                keywords={`${line.name}, Essen, ${line.name} Essen, productos Essen`}
            />

            <div style={palette} className="min-h-screen bg-[var(--line-tint)]">

                {/* Hero */}
                <section className="relative overflow-hidden text-white bg-gradient-to-br from-[var(--line-dark)] via-[var(--line-deep)] to-[var(--line-base)]">
                    {/* Decoración */}
                    <div className="absolute rounded-full pointer-events-none -top-24 -right-24 w-96 h-96 bg-[var(--line-accent)] opacity-30 blur-3xl"></div>
                    <div className="absolute rounded-full pointer-events-none -bottom-32 -left-20 w-80 h-80 bg-[var(--line-accent)] opacity-20 blur-3xl"></div>

                    <div className="relative grid items-center gap-8 px-4 py-12 mx-auto md:grid-cols-2 md:py-20 max-w-7xl">
                        <div className="text-center md:text-left">
                            <nav className="mb-4 text-sm text-white/70">
                                <Link to="/catalogo" className="hover:text-white hover:underline">Catálogo</Link>
                                <span className="mx-2">/</span>
                                <span>{line.name}</span>
                            </nav>

                            <h1 className="text-4xl font-bold leading-tight md:text-6xl">{line.name}</h1>

                            {line.description && (
                                <p className="mt-4 text-base leading-relaxed md:text-lg text-white/85">
                                    {line.description}
                                </p>
                            )}

                            <div className="flex flex-wrap justify-center gap-3 mt-6 md:justify-start">
                                <span className="px-3 py-1 text-sm rounded-full bg-white/15">
                                    {products.length} {products.length === 1 ? "producto" : "productos"}
                                </span>
                                {newCount > 0 && (
                                    <span className="px-3 py-1 text-sm rounded-full bg-white/15">
                                        {newCount} {newCount === 1 ? "nuevo" : "nuevos"}
                                    </span>
                                )}
                                {discountCount > 0 && (
                                    <span className="px-3 py-1 text-sm rounded-full bg-white/15">
                                        {discountCount} con descuento
                                    </span>
                                )}
                            </div>
                        </div>

                        {heroProducts.length > 0 ? (
                            <div className="relative w-full max-w-md mx-auto h-72 md:h-96">
                                {heroProducts.map((product, i) => (
                                    <div
                                        key={product.id}
                                        className={`absolute w-44 h-44 md:w-60 md:h-60 p-2 bg-white shadow-2xl rounded-2xl ring-4 ring-white/30 ${HERO_SLOTS[i]}`}
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="object-contain w-full h-full"
                                            onError={(e) => (e.currentTarget.style.display = "none")}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            line.image && (
                                <div className="flex justify-center">
                                    <img
                                        src={line.image}
                                        alt={line.name}
                                        className="object-cover w-64 h-64 shadow-2xl md:w-96 md:h-96 rounded-3xl ring-4 ring-white/30"
                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                    />
                                </div>
                            )
                        )}
                    </div>
                </section>

                {/* Video de la línea */}
                {line.video_url && (
                    <section className="px-4 pt-12 mx-auto max-w-7xl">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-2 h-8 rounded bg-[var(--line-accent)]"></span>
                            <h2 className="text-2xl font-bold md:text-3xl text-[var(--line-dark)]">
                                Conocé la línea
                            </h2>
                        </div>
                        <VerticalVideo url={line.video_url} title={line.name} poster={line.image} />
                    </section>
                )}

                {/* Productos */}
                <section className="px-4 py-12 mx-auto max-w-7xl">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="w-2 h-8 rounded bg-[var(--line-accent)]"></span>
                        <h2 className="text-2xl font-bold md:text-3xl text-[var(--line-dark)]">
                            Productos de {line.name}
                        </h2>
                    </div>

                    {products.length === 0 ? (
                        <div className="py-16 text-center bg-white rounded-lg shadow">
                            <p className="text-lg text-gray-600">Esta línea todavía no tiene productos disponibles.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>

                {/* CTA final */}
                <section className="px-4 pb-16 mx-auto max-w-7xl">
                    <div className="flex flex-col items-center gap-4 p-8 text-center rounded-2xl bg-[var(--line-dark)] text-white md:flex-row md:justify-between md:text-left">
                        <div>
                            <h3 className="text-xl font-bold md:text-2xl">¿Te interesa la línea {line.name}?</h3>
                            <p className="mt-1 text-white/80">Escribinos y te asesoramos para elegir lo ideal para tu cocina.</p>
                        </div>
                        <BtnWpp message={`Hola, quiero información sobre la línea ${line.name}`} />
                    </div>
                </section>
            </div>
        </>
    );
}
