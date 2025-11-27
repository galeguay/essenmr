import { useState, useEffect } from 'react';
import HeroPromotions from "../../components/public/HeroPromotions";
import NewProductsGrid from "../../components/public/NewProductsGrid";
import NewDiscountCard from "../../components/public/NewDiscountCard";
import ProductLineCard from '../../components/public/ProductLineCard';
import ProductCard from '../../components/public/ProductCard';
import { pb } from '../../lib/pocketbase';
import BtnWpp from '../../components/public/BtnWpp';

export default function Home() {

  const [productLines, setProductLines] = useState([]);
  const [discounts, setDiscounts] = useState ([]);
  const [loading, setLoading] = useState(true);

  const fetchDiscounts = async () => {
    try{
      const result = await pb.collection('products').getFullList({
        expand: 'product_line',
        sort: '-discount',
        filter: 'discount > 0'
      });

    setDiscounts(result);
    } catch (err) {
      console.error('Error fetching discounts:', err);
      alert('Error al cargar los descuentos de productos');
    } finally {
      // setLoading(false);
    }
  };

  const fetchProductLines = async () => {
    // setLoading(true);
    try {
      const result = await pb.collection('product_lines').getFullList({
        sort: 'name',
        filter: 'is_visible = true'
      });

      setProductLines(result);
    } catch (err) {
      console.error('Error fetching product lines:', err);
      alert('Error al cargar las líneas de productos');
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchProductLines(), fetchDiscounts()]).finally(() => setLoading(false));
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

      <HeroPromotions />

      <div className="container mx-auto px-4 py-8">
        <NewProductsGrid />
      </div>
      
      <div className="justify-center bg-orange-700 p-4 text-center mb-10">
        <div className="text-xl font-bold text-white mb-4">
          Si necesitás algún REPUESTO de piezas Essen ¡Escribime!
        </div>
          <BtnWpp />
      </div>

    </div>
  );
}