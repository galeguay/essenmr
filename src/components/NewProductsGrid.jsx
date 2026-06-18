import Card from "./Card";
import BtnWpp from "./BtnWpp";
import ProductCard from "./ProductCard";

export const productosDemo = [
  {
    id: 1,
    title: "Olla de Acero Inoxidable 24cm",
    line: "Contemporánea",
    description: "Apta para inducción, fondo triple capa.",
    image: "https://picsum.photos/400/300?random=1",
    isNew: true,
    discount: 20,
    isOutOfStock: false,
    ctaLabel: "Comprar ahora"
  },
  {
    id: 2,
    title: "Cacerola Antiadherente 20cm",
    line: "Contemporánea",
    description: "Revestimiento de teflón premium.",
    image: "https://picsum.photos/400/300?random=2",
    isNew: false,
    discount: null,
    isOutOfStock: false,
    ctaLabel: "Agregar al carrito"
  },
  {
    id: 3,
    title: "Sartén de Hierro Fundido 26cm",
    line: "Contemporánea",
    description: "Distribución de calor perfecta.",
    image: "https://picsum.photos/400/300?random=3",
    isNew: false,
    discount: 15,
    isOutOfStock: false,
    ctaLabel: "Comprar"
  },
  {
    id: 4,
    title: "Sartén Antiadherente 18cm",
    line: "Contemporánea",
    description: "Ideal para huevos y snacks.",
    image: "https://picsum.photos/400/300?random=4",
    isNew: true,
    discount: null,
    isOutOfStock: true,
    ctaLabel: "No disponible"
  }
];

export default function NewProductsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
      {productosDemo.map(producto => (
        <ProductCard
          key={producto.id}
          {...producto}
        />
      ))}
    </div>
  );
}