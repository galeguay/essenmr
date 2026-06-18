export default function BtnWpp({ message }) {
    const phone = "5492235012258"
    const msg = encodeURIComponent(message)
    const url = `https://wa.me/${phone}?text=${msg}`;

    return (
        <button
            onClick={() => window.open(url, '_self')}
            target="_blank"
            rel="noopener noreferrer"
            className="z-40 inline-block px-4 py-2 font-bold text-center text-green-600 transition bg-green-100 rounded-lg shadow-md cursor-pointer hover:bg-green-200"
        >
            <i className="text-lg bi bi-whatsapp me-1"></i>
            Consultar por WhatsApp
        </button>
    )
}