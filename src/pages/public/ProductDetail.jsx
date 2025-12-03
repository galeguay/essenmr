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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-2xl text-gray-600">Producto no encontrado</p>
      </div>
    );
  }

  // Ajustá esto según cómo guardes la imagen
  const imageUrl = product.image
    ? product.image    // si guardás URL directo
    : '/placeholder.jpg';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto mb-20 md:mb-40">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">

          <div className="relative aspect-square lg:aspect-auto">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 lg:p-12 flex flex-col justify-between">

            <div>
              {product.product_line && (
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  {product.product_line.name}
                </p>
              )}

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 my-2">
                {product.name}
              </h1>

              <div className="flex space-x-1 mb-4">
                {product.is_new && (
                  <div className="px-3 text-sm text-center uppercase bg-blue-200 text-blue-700">
                    nuevo
                  </div>
                )}
              </div>

              {product.description && (
                <div className="prose prose-lg text-gray-700 mb-8">
                  <p>{product.description}</p>
                </div>
              )}

              <div className="flex justify-around font-bold text-2xl mb-8">
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

            <div className="flex flex-col justify-center items-center">
              {product.discount > 0 ? (
                <div className="py-1 px-3 text-center uppercase font-bold rounded-t-lg bg-green-200 text-green-700">
                  {product.discount}% de descuento
                </div>
              ) : (
                <div className="h-7"></div>
              )}

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
