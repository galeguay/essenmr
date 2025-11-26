const slides = [
  { img: "novedad1rein.webp", title: "Rein, el Robot de Cocina Inteligente y multifuncional" },
  { img: "novedad2rein.webp", title: "Rein diseñado para que lo difícil sea fácil" },
  { img: "novedad2.webp", title: "Nueva Cafetera Italiana" },
  { img: "novedad1.webp", title: "Nuevo vaso térmico" },
  { img: "novedad3.webp", title: "Nueva Cacerola Fusión de acero inoxidable con aluminio" },
];

export default function LaunchesCarousel() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold bg-orange-500 text-white inline-block px-6 py-2 rounded-t-lg mb-6 border-b-4 border-gray-700">
          Lanzamientos
        </h2>

        <div className="relative overflow-hidden rounded-xl shadow-2xl">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
            {slides.map((slide, i) => (
              <div key={i} className="relative flex-none w-full snap-center">
                <img src={`/images/${slide.img}`} alt={slide.title} className="w-full h-96 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-6">
                  <h3 className="text-xl md:text-2xl font-bold">{slide.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}