export default function BtnWpp({ message }) {
    const phone = "5492235012258"
    const msg = encodeURIComponent(message)
    const url = `https://wa.me/${phone}?text=${msg}`;

    return (
        <button
            onClick={() => window.open(url, '_self')}
            target="_blank"
            rel="noopener noreferrer"
            className="z-40 inline-block px-4 py-2 font-bold text-center text-white transition bg-green-600 rounded-lg shadow-md hover:bg-green-700"
        >
            <i className="bi bi-whatsapp me-2"></i>
            Consultar por WhatsApp
        </button>
    )
}