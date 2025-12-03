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
        // setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          product_line (*)
        `)
                .gt('discount', 0)
                .eq('is_visible', true)
                .order('discount', { ascending: false });

            if (error) throw error;

            setDiscounts(data);
        } catch (err) {
            console.error('Error fetching discounts:', err);
            //alert('Error al cargar los descuentos de productos');
        } finally {
            // setLoading(false);
        }
    };

    const fetchNewProducts = async () => {
        // setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`*, product_line (*)`)
                .eq('is_new', true)
                .eq('is_visible', true);

            if (error) throw error;

            setNewProducts(data);
        } catch (err) {
            console.error('Error fetching discounts:', err);
            //alert('Error al cargar los descuentos de productos');
        } finally {
            // setLoading(false);
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
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        Promise.all([fetchProductLines(), fetchNewProducts(), fetchDiscounts()]).finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">

            {loading ? "" : ""}

            {/* Descuentos */}
            <section className="flex justify-around py-4">
                {discounts.map((product) => (
                    <NewDiscountCard key={product.id} productName={product.name} productEssenID={product.essen_id} discount={product.discount} image={product.image} />
                ))}
            </section>

            <section className="flex flex-wrap justify-center items-center bg-green-200 space-y-2 md:space-y-0 md:space-x-6 py-2">

                <div className="md:flex items-center">
                    <i className="bi bi-credit-card me-2 text-2xl"></i>
                    Aceptamos todos los medios de pagos.
                    <a
                        href="/promociones"
                        className="flex ps-1 underline me-3">
                        Ver promociones financieras
                    </a>
                </div>

                <div className="flex items-center">
                    <i className="bi bi-box-seam me-2 text-2xl"></i>
                    Envíos a todo el país
                </div>

            </section>

            {/* Lineas */}
            <section className="flex justify-center bg-gray-100 my-6 shadow-[inset_0_10px_10px_-10px_rgba(0,0,0,0.35),inset_0_-10px_10px_-10px_rgba(0,0,0,0.35)] p-4">
                <div className="container px-4">
                    <div className="flex gap-5 justify-around py-6">
                        {productLines.map((line) => (
                            <ProductLineCard key={line.id} productLine={line} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Novedades */}
            {newProducts > 0 ?<section className="py-12">
                <div className="container mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gray-700 text-white inline-block px-6 py-2 rounded-t-lg border-b-4 border-orange-500">
                        Novedades
                    </h2>
                    <div className="w-full h-5 bg-gray-700 mb-4">
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {newProducts.map((np) => (
                            <NewReleaseCard key={np.essen_id} title={np.name} image={np.image} />
                        ))}
                    </div>
                </div>
            </section>: ""}

            <Promotions />

            <div className="justify-center bg-orange-700 p-4 text-center mb-10">
                <div className="text-xl font-bold text-white mb-4">
                    Si necesitás algún REPUESTO de piezas Essen ¡Escribime!
                </div>
                <BtnWpp />
            </div>

        </div>
    );
}