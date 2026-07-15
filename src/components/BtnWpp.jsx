import ReactGA from "react-ga4";

export default function BtnWpp({ message }) {
    const phone = "5492235012258";
    const msg = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${msg}`;

    const handleWhatsAppClick = (e) => {
        e.preventDefault();

        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'conversion', {
                'send_to': 'AW-612922958/mGdmCO-TmdAcEM7soaQC', 
            });
        }

        ReactGA.event({
            category: "Contacto",
            action: "Clic_WhatsApp",
            label: message 
        });

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleWhatsAppClick}
            className="z-40 inline-block px-4 py-2 font-bold text-center text-green-600 transition bg-green-100 rounded-lg shadow-md cursor-pointer hover:bg-green-200"
        >
            <i className="text-lg bi bi-whatsapp me-1"></i>
            Consultar por WhatsApp
        </button>
    );
}