import Title from "./Title";

export default function Promotions() {

    const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });

    return (
        <div id="promociones" className="container flex flex-col md:mx-auto">
            <Title className="text-center mb-1">
                Promociones financieras en {currentMonth.toUpperCase()}
            </Title>
            <div className="flex justify-center">
                <div className="w-fit md:bg-gray-100 p-3 md:shadow-[inset_0_10px_10px_-10px_rgba(0,0,0,0.35),inset_0_-10px_10px_-10px_rgba(0,0,0,0.35),inset_10px_10px_10px_-10px_rgba(0,0,0,0.35),inset_-10px_10px_10px_-10px_rgba(0,0,0,0.35)]">
                    <img
                        src="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/public/images/tarjetas.webp"
                        className="object-contain p-3 md:p-6 h-auto w-250"
                        alt="Promociones"
                    />
                </div>
            </div>
        </div>
    );
}