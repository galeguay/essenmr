export default function BtnWpp({ message }) {
    const phone = "5492235012258"
    const msg = encodeURIComponent(message)
    const url = `https://wa.me/${phone}?text=${msg}`;

    const handleClick = (e) => {
        e.preventDefault();

        // Verificamos si gtag está definido globalmente (evita errores con AdBlockers)
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            window.gtag('event', 'conversion', {
                'send_to': 'AW-612922958/bN90CPPn-b0cEM7soaQC',
                'event_callback': () => {
                    window.open(url, '_self');
                }
            });
        } else {
            // Fallback: si gtag no carga, redirigimos directamente a WhatsApp
            window.open(url, '_self');
        }
    };

    return (
        <button
            onClick={handleClick}
            className="z-40 inline-block px-4 py-2 font-bold text-center text-green-600 transition bg-green-100 rounded-lg shadow-md cursor-pointer hover:bg-green-200"
        >
            <i className="text-lg bi bi-whatsapp me-1"></i>
            Consultar por WhatsApp
        </button>
    )
}