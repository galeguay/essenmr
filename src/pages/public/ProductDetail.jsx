import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BtnWpp from '../../components/public/BtnWpp';
import { supabase } from '../../lib/supabase';
import Promotions from '../../components/public/Promotions';

export default function ProductDetail() {
    const { essen_id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [essen_id]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select(`
            *,
            product_line(*)
          `)
                    .eq('essen_id', essen_id)
                    .maybeSingle();

                if (error) throw error;

                setProduct(data);
            } catch (err) {
                console.error('Error cargando producto:', err);
                if (err.code === 'PGRST116') {
                    // registro no encontrado
                    /* navigate('/404', { replace: true }); */
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [essen_id, navigate]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-16 h-16 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-2xl text-gray-600">Producto no encontrado</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-8 bg-gray-50">
            <div className="mx-auto mb-20 max-w-7xl md:mb-40">

                <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">

                    <figure className="relative aspect-square lg:aspect-auto">
                        <img
                            loading="lazy"
                            src={product.image || "../../cacerola.webp"}
                            alt={product.name}
                            className="object-contain w-full h-full"
                            onError={(e) => {
                                e.currentTarget.src = "../../cacerola.webp";
                            }}
                        />
                    </figure>

                    <div className="flex flex-col justify-between p-6 lg:p-12">
                        <div>
                            {product.product_line && (
                                <p className="text-xl lg:text-2xl m-0 tracking-wider text-gray-500">
                                    {product.product_line.name}
                                </p>
                            )}

                            <h3 className="capitalize mb-3 font-bold text-gray-900 text-2xl lg:text-4xl">
                                {product.name.toLowerCase()}
                            </h3>

                            {/* Badges (Etiquetas) */}
                            <div className="flex gap-1 mb-3 items-center text-xl">

                                {!product.is_new &&
                                    <div className="px-6 font-bold text-white uppercase bg-blue-500 w-fit">
                                        Nuevo
                                    </div>}

                                {product.discount > 0 &&
                                    <div className="px-6 font-bold text-white uppercase bg-green-500 w-fit to-emerald-300">
                                        <span className="">{product.discount}</span>
                                        <span className=" uppercase">% descuento</span>
                                    </div>}

                                {(product.stock_quantity < 1) &&
                                    <div className="px-6 font-bold text-white uppercase bg-gray-400 w-fit">
                                        Sin Stock
                                    </div>}
                            </div>

                            {product.description && (
                                <div className="mb-8 prose prose-lg">
                                    {/* Agregamos la clase aquí */}
                                    <p className="whitespace-pre-wrap">{product.description}</p>
                                </div>
                            )}

                            <div className="flex justify-around mb-8 text-2xl font-bold">
                                {product.diameter && (
                                    <div className="flex flex-col items-center">
                                        <span>{product.diameter} CM</span>
                                        <span className="text-sm">Diámetro</span>
                                    </div>
                                )}

                                {product.capacity && (
                                    <div className="flex flex-col items-center">
                                        <span>{product.capacity} L</span>
                                        <span className="text-sm">Capacidad</span>
                                    </div>
                                )}

                                {product.guests && (
                                    <div className="flex flex-col items-center">
                                        <span>{product.guests}</span>
                                        <span className="text-sm">Comensales</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            {product.stock_quantity < 1 ? (
                                <button
                                    className="w-full rounded-lg px-5 py-2.5 text-sm font-medium bg-gray-400 text-white cursor-not-allowed"
                                    disabled
                                >
                                    No disponible
                                </button>
                            ) : (
                                <BtnWpp message={`Hola, quiero averiguar por "${product.name}"`} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Promotions />
        </div>
    );
}
