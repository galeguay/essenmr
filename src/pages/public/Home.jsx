import { useState, useEffect } from 'react';
import NewDiscountCard from "../../components/public/NewDiscountCard";
import ProductLineCard from '../../components/public/ProductLineCard';
import Promotions from '../../components/public/Promotions';
import { supabase } from '../../lib/supabase';
import BtnWpp from '../../components/public/BtnWpp';
import NewReleaseCard from '../../components/public/NewReleaseCard';

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
            // Usamos !inner para filtrar basándonos en la tabla relacionada
            const queryCombos = supabase
                .from('products')
                .select(`*, product_line!inner (*)`)
                .eq('is_visible', true)
                .ilike('product_line.name', '%Combos%'); // Busca que el nombre contenga "Combos"

            // Ejecutar ambas consultas en paralelo
            const [resDiscounts, resCombos] = await Promise.all([queryDiscounts, queryCombos]);

            if (resDiscounts.error) throw resDiscounts.error;
            if (resCombos.error) throw resCombos.error;

            const discountsData = resDiscounts.data || [];
            const combosData = resCombos.data || [];

            // 3. Combinar resultados y eliminar duplicados (por si un combo tiene descuento)
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

    return (
        <div className="space-y-6">

            {loading ? "" : ""}

            {/* Descuentos y Combos */}
            <section className="flex flex-wrap justify-center gap-6 p-4">
                {discounts.map((product) => (
                    <NewDiscountCard 
                        key={product.id} 
                        productName={product.name.toLowerCase().includes('combo') ? '' : product.name}
                        productEssenID={product.essen_id}
                        discount={product.name.toLowerCase().includes('combo') ? '' : `${product.discount}%`}
                        discountText={product.name.toLowerCase().includes('combo') ? product.name : `DESCUENTO`}
                        image={product.image} 
                    />
                ))}
            </section>

            <section className="flex flex-wrap items-center justify-center py-2 space-y-2 bg-green-200 md:space-y-0 md:space-x-6">
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

            {/* Lineas */}
            <section className="flex justify-center bg-gray-100 my-6 shadow-[inset_0_10px_10px_-10px_rgba(0,0,0,0.35),inset_0_-10px_10px_-10px_rgba(0,0,0,0.35)] py-4 px-2">
                <div className="container px-2 lg:flex lg:justify-center ">
                    <div
                        className="justify-around gap-2 overflow-x-auto flex lg:overflow-x-visible xl:w-[80%]"
                    >
                        {productLines.map((line) => (
                            <div key={line.id} className="min-w-[40%] sm:min-w-[35%] md:min-w-[18%] lg:min-w-0">
                                <ProductLineCard productLine={line} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Novedades */}
            {newProducts.length > 0 ? (
                <section className="py-12">
                    <div className="container mx-auto">
                        <h2 className="inline-block px-6 py-2 text-2xl font-bold text-white bg-gray-700 border-b-4 border-orange-500 rounded-t-lg md:text-3xl">
                            Novedades
                        </h2>
                        <div className="w-full h-5 mb-4 bg-gray-700">
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {newProducts.map((np) => (
                                <NewReleaseCard key={np.essen_id} title={np.name} image={np.image} />
                            ))}
                        </div>
                    </div>
                </section>
            ) : ""}

            <div id="promotions" className="mb-12">
                <Promotions />
            </div>
    {/* 
                <div className="justify-center p-4 mb-10 text-center bg-orange-700">
                    <div className="mb-4 text-xl font-bold text-white">
                        Si necesitás algún REPUESTO ¡Escribime!
                    </div>
                    <BtnWpp />
                </div> */}

        </div >
    );
}