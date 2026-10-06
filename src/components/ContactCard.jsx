import ReactGA from "react-ga4";
import CtaCard from "./CtaCard";

// Tarjeta que invita a contactar para ver los productos o hacer cualquier consulta.
export default function ContactCard({ gaAction = "Clic_Contacto_Card", className = "" }) {
    const handleClick = () => {
        ReactGA.event({
            category: "Contacto",
            action: gaAction,
            label: "WhatsApp"
        });
    };

    return (
        <CtaCard
            icon="bi-chat-heart-fill"
            title="¿Querés ver los productos en persona o tenés una consulta?"
            text="Escribime y coordinamos una cita para que veas los productos. Respondo cualquier duda sobre productos, precios, promociones y formas de pago."
            buttonLabel="Enviar Whatsapp"
            buttonIcon="bi-whatsapp"
            href="https://wa.me/5492235012258"
            onClick={handleClick}
            className={className}
        />
    );
}
