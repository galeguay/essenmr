import { useState, useEffect } from 'react';
import HeroPromotions from "../../components/public/HeroPromotions";
import NewProductsGrid from "../../components/public/NewProductsGrid";
import { pb } from '../../lib/pocketbase';

export default function Home() {

  const [productLines, setProductLines] = useState([]);

const fetchProductLines = async () => {
  // setLoading(true);  // descomenta si usas un estado de loading
  try {
    const result = await pb.collection('product_lines').getFullList({
      sort: 'name',
    });

    setProductLines(result); // getFullList ya devuelve el array directamente
  } catch (err) {
    console.error('Error fetching product lines:', err);
    alert('Error al cargar las líneas de productos');
  } finally {
    // setLoading(false);
  }
};

  useEffect(() => {
    fetchProductLines();
  }, []);

  return (
    <div>
      <HeroPromotions />
      <div className="container mx-auto px-4 py-8">
        <NewProductsGrid />
      </div>
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center bg-gray-800 text-white py-4 mb-2">
            Líneas de Productos
          </h2>
          <div className="h-2 bg-orange-500 mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {productLines.map((line) => (
              <a
                key={line.string_id}
                href={`/catalogo/${line.string_id}`}
                className="block bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden"
              >
                <div className="flex items-center p-4">
                  <img
                    src={`/images/lineas/${line.name.toUpperCase()}.webp`}
                    alt={line.name}
                    className="w-24 h-24 object-contain rounded"
                  />
                  <h3 className="ml-6 text-2xl font-bold text-gray-700">{line.name}</h3>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 bg-orange-100 border-2 border-orange-600 rounded-lg p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-orange-700">
              Si necesitás algún <span className="underline">REPUESTO</span> de una pieza Essen<span>&nbsp;</span>
              <a
                href="https://wa.me/5492235012258?text=Hola,%20necesito%20un%20repuesto"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-2xl font-bold text-orange-600 underline hover:text-orange-800"
              >
                ¡Contactame acá!
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}