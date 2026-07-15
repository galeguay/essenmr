import Seo from '../../components/Seo';
import BtnLink from '../../components/BtnLink';
import ReactGA from "react-ga4";

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
            <div className="px-4 py-50">
                <div className="flex flex-col items-center mx-auto max-w-7xl">
                    <div className="text-center mb-12 text-2xl max-w-[500px]">
                        Soy María Rosa, emprendedora oficial Essen EIE 106891, radicada en Mar del Plata
                        ¡Contactame por cualquier consulta!
                    </div>
                    <div className="flex flex-col items-center gap-4">

                        <BtnLink 
                            href="tel:+5492235012258"
                            onClick={() => handleContactClick('Llamada Telefonica')}
                        >
                            <i className="bi bi-telephone-fill"></i> Llamar (+54 9 223 501-2258)
                        </BtnLink>

                        <BtnLink 
                            href="https://wa.me/5492235012258"
                            onClick={() => handleContactClick('WhatsApp')}
                        >
                            <i className="bi bi-whatsapp"></i> Enviar Whatsapp
                        </BtnLink>

                        <BtnLink 
                            href="https://g.co/kgs/NuUKntR"
                            onClick={() => handleContactClick('Google Perfil')}
                        >
                            <i className="bi bi-google"></i> Perfil Google
                        </BtnLink>

                    </div>
                </div>
            </div>
        </>
    );
}