import Seo from '../../components/Seo';
import ContactCard from '../../components/ContactCard';

const PHOTO_URL = "https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/public/images/MR.webp";

export default function AboutMe() {
    
    return (
        <>
            <Seo
                title="Sobre mí | EssenMR"
                description="Conocé a María Rosa, emprendedora oficial Essen en Mar del Plata y contactate para consultas sobre productos de cocina Essen."
                keywords="María Rosa, EssenMR, emprendimiento, cocina Essen, Mar del Plata"
            />
            <div className="px-4 py-10 md:py-16">
                <div className="flex flex-col items-center mx-auto max-w-7xl">
                    <img
                        src={PHOTO_URL}
                        alt="María Rosa, emprendedora oficial Essen"
                        className="object-cover w-48 h-48 mb-8 border-4 border-orange-600 rounded-full shadow-lg md:w-56 md:h-56"
                    />
                    <div className="text-center mb-12 text-2xl max-w-[500px]">
                        Soy María Rosa, emprendedora oficial Essen EIE 106891, radicada en Mar del Plata, con más de 10 años de experiencia.
                    </div>

                    <ContactCard gaAction="Clic_Redes_AboutMe" className="mb-10 max-w-[500px]" />
                </div>
            </div>
        </>
    );
}