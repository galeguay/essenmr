import { useState, useEffect } from 'react';
import NewDiscountCard from "../../components/public/NewDiscountCard";
import ProductLineCard from '../../components/public/ProductLineCard';
import Promotions from '../../components/public/Promotions';
import { supabase } from '../../lib/supabase';
import BtnWpp from '../../components/public/BtnWpp';
import NewReleaseCard from '../../components/public/NewReleaseCard';
import ProductCard from '../../components/public/ProductCard';
import AnnouncementBanner from '../../components/public/AnnouncementBanner';
import DoubleImageBanner from '../../components/public/DoubleImageBanner';
import Title from '../../components/public/Title';
import HeroFusionBanner from '../../components/public/HeroFusionBanner';
import Seo from '../../components/public/Seo';

export default function Home() {

    const [productLines, setProductLines] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDiscounts = async () => {
        try {
            const queryDiscounts = supabase
                .from('products')
                .select(`*, product_line (*)`)
                .gt('discount', 0)
                .eq('is_visible', true)
                .order('discount', { ascending: false });

            const queryCombos = supabase
                .from('products')
                .select(`*, product_line!inner (*)`)
                .eq('is_visible', true)
                .ilike('product_line.name', '%Combos%');

            const [resDiscounts, resCombos] = await Promise.all([queryDiscounts, queryCombos]);

            if (resDiscounts.error) throw resDiscounts.error;
            if (resCombos.error) throw resCombos.error;

            const discountsData = resDiscounts.data || [];
            const combosData = resCombos.data || [];

            const combined = [...discountsData];
            const existingIds = new Set(combined.map(p => p.id));

            combosData.forEach(p => {
                if (!existingIds.has(p.id)) {
                    combined.push(p);
                }
            });

            setDiscounts(combined);

        } catch (err) {
            console.error('Error fetching discounts/combos:', err);
        }
    };

    const fetchNewProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`*, product_line (*)`)
                .eq('is_new', true)
                .eq('is_visible', true);
            if (error) throw error;
            setNewProducts(data);
        } catch (err) {
            console.error('Error fetching new products:', err);
        }
    };

    const fetchProductLines = async () => {
        try {
            const { data, error } = await supabase
                .from('product_lines')
                .select('*')
                .eq('is_visible', true)
                .order('name', { ascending: true });

            if (error) throw error;

            setProductLines(data);
        } catch (err) {
            console.error('Error fetching product lines:', err);
            alert('Error al cargar las líneas de productos');
        }
    };

    // 1. Manejo de carga inicial de datos
    useEffect(() => {
        setLoading(true);
        Promise.all([fetchProductLines(), fetchNewProducts(), fetchDiscounts()])
            .finally(() => setLoading(false));
    }, []);

    // 2. Ejecutar el scroll SOLO cuando la carga haya terminado
    useEffect(() => {
        if (!loading) {
            const hash = window.location.hash;
            if (hash) {
                setTimeout(() => {
                    const element = document.querySelector(hash);
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                    }
                }, 300); // Mantenemos un pequeño delay para el render final de imágenes
            }
        }
    }, [loading]); // Agregamos 'loading' como dependencia

    const getGridClasses = (length) => {
        if (length === 1) return "grid-cols-1";
        if (length === 2) return "grid-cols-1 md:grid-cols-2";
        if (length === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    };

    return (
        <>
            <Seo
                title="EssenMR - Ofertas y novedades en productos de cocina Essen"
                description="Encontrá combos, promociones y nuevos lanzamientos de productos Essen en Mar del Plata con envío a todo el país."
                image="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/images/plan_canje.webp"
                keywords="Essen, productos Essen, ollas, sartenes, Mar del Plata, promociones, combos"
            />
            <div className="">

                {loading ? "" : ""}

                <HeroFusionBanner
                    title="Combos Mundiales 🇦🇷"
                    titleColor="text-white"
                    text="Con la compra de productos seleccionados podés acceder a la SARTÉN 18 CM ARGENTINA mundial."
                    textColor="text-white"
                    image="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/images/sarten_18_arg.webp"
                    link="/producto/38651903"
                    backgroundColor="bg-sky-500"
                >
                    <BtnWpp
                        message="¡Hola! Vi el anuncio del HOT ESSEN en la página y quiero saber más."
                    />
                </HeroFusionBanner>

                <AnnouncementBanner
                    titleClassName="text-[#493f51]"
                    titleTop="true"
                    image="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/images/promo_modo1.webp"
                    expirationDate="00:00 22-06-2026"
                    bgColor='#050810'
                />

                <AnnouncementBanner
                    image="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/images/plan_canje.webp"
                    className="pt-9 pb-8"
                />

                <section className="flex flex-col items-center justify-center w-full py-12 bg-green-200">
                    <div className={`grid gap-3 px-6 md:px-16 justify-center container ${getGridClasses(discounts.length)}`}>
                        {discounts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                </section>

                <section className="flex flex-col items-center py-12">
                    <Title className="mb-1">
                        Lineas de productos
                    </Title>
                    <div className="flex w-full justify-center bg-gray-100 shadow-[inset_0_10px_10px_-10px_rgba(0,0,0,0.35),inset_0_-10px_10px_-10px_rgba(0,0,0,0.35)]">
                        <div className="container lg:flex lg:justify-center ">
                            <div
                                className="flex justify-around gap-2 py-6 overflow-x-auto lg:overflow-x-visible xl:w-full"
                            >
                                {productLines.map((line) => (
                                    <div key={line.id} className="min-w-[40%] sm:min-w-[35%] md:min-w-[18%] lg:min-w-0">
                                        <ProductLineCard productLine={line} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="flex flex-wrap items-center justify-center pt-4 pb-16 space-y-2 md:space-y-0 md:space-x-6">
                    <div className="flex flex-wrap items-center justify-center mb-5 md:mb-0">
                        <i className="text-2xl bi bi-credit-card me-2"></i>
                        Aceptamos todos los medios de pagos.
                        <a href="#promociones"
                            className="flex underline ps-1 me-3"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('promociones')?.scrollIntoView({
                                    behavior: 'smooth'
                                });
                            }}>
                            Ver promociones financieras
                        </a>
                    </div>

                    <div className="flex items-center">
                        <i className="text-2xl bi bi-box-seam me-2"></i>
                        Envíos a todo el país
                    </div>
                </section>

                {newProducts.length > 0 ? (
                    <section className="py-12 bg-black">
                        <div className="text-4xl font-bold text-center text-white mb-10">
                            Nuevos productos
                        </div>
                        <div className="container mx-auto">
                            {/* Contenedor flex en columna y centrado */}
                            <div className="flex flex-col items-center gap-8 px-6">
                                {newProducts.map((np) => (
                                    <NewReleaseCard
                                        key={np.essen_id}
                                        productId={np.essen_id}
                                        title={np.name}
                                        image={np.image}
                                        description={np.description}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                ) : ""}

                {/* ID actualizado a 'promociones' para coincidir con el Navbar */}
                <div id="promociones" className="my-12">
                    <Promotions />
                </div>

            </div >
        </>
    );
}