import Seo from '../../components/Seo';
import BtnLink from '../../components/BtnLink';
import ReactGA from "react-ga4";

const PHOTO_URL = "https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/public/images/MR.webp";

export default function AboutMe() {
    
    // Función para registrar los clics en los botones de contacto de esta página
    const handleContactClick = (method) => {
        ReactGA.event({
            category: "Contacto",
            action: "Clic_Redes_AboutMe",
            label: method
        });
    };

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

                    <div className="flex items-start gap-4 p-5 mb-10 text-left border border-orange-200 rounded-xl bg-orange-50 max-w-[500px]">
                        <i className="mt-1 text-3xl text-orange-600 bi bi-chat-heart-fill"></i>
                        <div>
                            <p className="text-xl font-bold text-orange-900">¿Querés ver los productos o tenés una consulta?</p>
                            <p className="mt-1 text-gray-700">
                                Escribime y coordinamos una cita para que veas los productos en persona.
                                Respondo cualquier duda sobre productos, precios, promociones y formas de pago.
                            </p>
                            <BtnLink
                                href="https://wa.me/5492235012258"
                                className="mt-4"
                                onClick={() => handleContactClick('WhatsApp')}
                            >
                                <i className="bi bi-whatsapp"></i> Enviar Whatsapp
                            </BtnLink>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}