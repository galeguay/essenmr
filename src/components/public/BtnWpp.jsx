export default function BtnWpp({ message }) {
  const phone = "5492235012258"
  const msg = encodeURIComponent(message)
  
  return (
    <a
      href={`https://wa.me/${phone}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 text-center rounded-lg transition shadow-md z-40"
    >
      <i className="bi bi-whatsapp me-2"></i>
      Consultar por WhatsApp
    </a>
  )
}