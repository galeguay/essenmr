import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getLinePalette } from "../../utils/linePalette";
import ProductCard from "../../components/ProductCard";
import BtnWpp from "../../components/BtnWpp";
import Seo from "../../components/Seo";

const SAMPLES_PER_LINE = 4;

// Primero nuevos, luego con descuento, después el resto
const priority = (p) => (p.is_new ? 0 : p.discount > 0 ? 1 : 2);

function LineSection({ line, products }) {
    const palette = useMemo(() => getLinePalette(line.color), [line.color]);
    const samples = useMemo(
        () => [...products].sort((a, b) => priority(a) - priority(b)).slice(0, SAMPLES_PER_LINE),
        [products]
    );
    const blurb = line.short_description || line.description;
    const href = line.string_id ? `/linea/${line.string_id}` : `/productos?product_line=${encodeURIComponent(line.name)}`;

    return (
        <section style={palette} className="bg-[var(--line-tint)]">
            <div className="px-4 py-12 mx-auto max-w-7xl">
                <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold md:text-4xl text-[var(--line-dark)]">{line.name}</h2>
                        <div className="w-20 h-1.5 mt-3 rounded-full bg-[var(--line-accent)]"></div>
                        {blurb && (
                            <p className="max-w-2xl mt-4 leading-relaxed text-gray-700 md:text-lg">{blurb}</p>
                        )}
                    </div>
                    <Link
                        to={href}
                        className="self-start px-5 py-2.5 font-semibold rounded-lg shrink-0 bg-[var(--line-accent)] text-[var(--line-on-accent)] hover:brightness-110 md:self-auto"
                    >
                        Ver toda la línea <span aria-hidden="true">→</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {samples.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function Catalog() {
    const [lines, setLines] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [linesRes, productsRes] = await Promise.all([
                    supabase.from("product_lines").select("*").eq("is_visible", true).order("priority", { ascending: true }).order("name", { ascending: true }),
                    supabase.from("products").select("*, product_line (*)").eq("is_visible", true).order("essen_id", { ascending: false }),
                ]);
                if (linesRes.error) throw linesRes.error;
                if (productsRes.error) throw productsRes.error;
                setLines(linesRes.data || []);
                setProducts(productsRes.data || []);
            } catch (err) {
                console.error("Error cargando el catálogo:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const productsByLine = useMemo(() => {
        const map = new Map();
        products.forEach((p) => {
            const id = p.product_line?.id;
            if (id == null) return;
            if (!map.has(id)) map.set(id, []);
            map.get(id).push(p);
        });
        return map;
    }, [products]);

    // Solo se presentan las líneas que tienen al menos un producto visible
    const visibleLines = useMemo(
        () => lines.filter((line) => productsByLine.has(line.id)),
        [lines, productsByLine]
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-t-4 border-b-4 border-orange-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <Seo
                title="Catálogo de líneas Essen | EssenMR"
                description="Conocé las líneas de productos Essen, qué las distingue y algunos productos de cada una para ayudarte a elegir."
                keywords="líneas Essen, catálogo Essen, ollas, sartenes, batería de cocina"
            />

            <div className="min-h-screen bg-stone-50">
                {/* Introducción */}
                <header className="px-4 py-12 text-center text-white bg-orange-600 md:py-16">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-3xl font-bold md:text-5xl">Catálogo</h1>

                        {visibleLines.length > 1 && (
                            <nav aria-label="Líneas" className="mt-8">
                                <ul className="flex flex-wrap justify-center gap-2">
                                    {visibleLines.map((line) => (
                                        <li key={line.id}>
                                            <a
                                                href={`#linea-${line.id}`}
                                                className="inline-block px-4 py-1.5 text-sm font-medium text-white border rounded-full border-white/40 bg-white/10 hover:bg-white hover:text-orange-700"
                                            >
                                                {line.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}
                    </div>
                </header>

                {visibleLines.length === 0 ? (
                    <p className="py-20 text-center text-gray-600">No hay líneas disponibles por el momento.</p>
                ) : (
                    visibleLines.map((line) => (
                        <div key={line.id} id={`linea-${line.id}`} className="scroll-mt-20">
                            <LineSection line={line} products={productsByLine.get(line.id) || []} />
                        </div>
                    ))
                )}

                {/* Asesoramiento */}
                <section className="px-4 py-12 mx-auto max-w-7xl">
                    <div className="flex flex-col items-center gap-4 p-8 text-center text-white rounded-2xl bg-stone-900 md:flex-row md:justify-between md:text-left">
                        <div>
                            <h2 className="text-xl font-bold md:text-2xl">¿No sabés por dónde empezar?</h2>
                            <p className="mt-1 text-white/80">Contanos qué cocinás y te recomendamos la línea ideal.</p>
                        </div>
                        <BtnWpp message="Hola, quiero que me ayuden a elegir una línea de productos Essen" />
                    </div>
                </section>
            </div>
        </>
    );
}
