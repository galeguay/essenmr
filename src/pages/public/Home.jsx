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

export default function Home() {

    const [productLines, setProductLines] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDiscounts = async () => {
        try {
            // 1. Buscar productos con descuento
            const queryDiscounts = supabase
                .from('products')
                .select(`*, product_line (*)`)
                .gt('discount', 0)
                .eq('is_visible', true)
                .order('discount', { ascending: false });

            // 2. Buscar productos de la categoría 'Combos'
            const queryCombos = supabase
                .from('products')
                .select(`*, product_line!inner (*)`)
                .eq('is_visible', true)
                .ilike('product_line.name', '%Combos%');

            // Ejecutar ambas consultas en paralelo
            const [resDiscounts, resCombos] = await Promise.all([queryDiscounts, queryCombos]);

            if (resDiscounts.error) throw resDiscounts.error;
            if (resCombos.error) throw resCombos.error;

            const discountsData = resDiscounts.data || [];
            const combosData = resCombos.data || [];

            // 3. Combinar resultados y eliminar duplicados
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

    useEffect(() => {
        Promise.all([fetchProductLines(), fetchNewProducts(), fetchDiscounts()])
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 300); 
        }
    }, []);

    const getGridClasses = (length) => {
        if (length === 1) return "grid-cols-1";
        if (length === 2) return "grid-cols-1 md:grid-cols-2";
        if (length === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    };

    return (
        <div className="">

            {loading ? "" : ""}

            {/* Anuncio con imagen a la izquierda (por defecto) */}
            <AnnouncementBanner
                image="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/images/plan_canje_X2.webp"
                imageMobile="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/images/plan_canje_X2_mobile.webp"
                bgColor="#57282f"
            />

            <AnnouncementBanner
                image="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/images/plan_canje2.webp"
            />

            {/* Descuentos y Combos */}
            <section className="flex flex-col w-full items-center justify-center bg-green-200 py-12">
                <div className={`grid gap-3 px-6 md:px-16 justify-center container ${getGridClasses(discounts.length)}`}>
                    {discounts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>

            </section>


            {/* Lineas */}
            <section className="flex flex-col py-12 items-center">
                <Title className="mb-1">
                    Lineas de productos
                </Title>
                <div className="flex w-full justify-center bg-gray-100 shadow-[inset_0_10px_10px_-10px_rgba(0,0,0,0.35),inset_0_-10px_10px_-10px_rgba(0,0,0,0.35)]">
                    <div className="container lg:flex lg:justify-center ">
                        <div
                            className="flex py-6 justify-around gap-2 overflow-x-auto lg:overflow-x-visible xl:w-full"
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
                    <a href="#promotions"
                        className="flex underline ps-1 me-3"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('promotions')?.scrollIntoView({
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

            {/* Anuncio con imagen a la izquierda (por defecto) */}


            {/* Lanzamientos */}
            {newProducts.length > 0 ? (
                <section className="py-12 bg-[#626164]">

                    <DoubleImageBanner
                        image1="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/images/banner_linea_rosa1.webp"
                        image2="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/images/banner_linea_rosa2.webp"
                        bgColor="#626164"
                    />

                    <div className="container mx-auto">
                        {/*                         <h2 className="inline-block px-6 py-2 text-2xl font-bold text-white bg-gray-700 border-b-4 border-orange-500 rounded-t-lg md:text-3xl">
                            Lanzamientos
                        </h2>
                        <div className="w-full h-5 mb-4 bg-gray-700">
                        </div> */}

                        <div className="px-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center">
                            {newProducts.map((np) => (
                                <NewReleaseCard key={np.essen_id} productId={np.essen_id} title={np.name} image={np.image} />
                            ))}
                        </div>
                    </div>
                </section>
            ) : ""}

            <div id="promotions" className="my-12">
                <Promotions />
            </div>

        </div >
    );
}