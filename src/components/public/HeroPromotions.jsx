import NewReleaseCard from "./NewReleaseCard";


export default function HeroPromotions() {

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold bg-gray-700 text-white inline-block px-6 py-2 rounded-t-lg mb-4 border-b-4 border-orange-500">
          Novedades de Noviembre 2025
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <NewReleaseCard />
          <NewReleaseCard />
          <NewReleaseCard />
          <NewReleaseCard />
        </div>
      </div>
    </section>
  );
}