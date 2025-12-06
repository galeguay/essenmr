export default function Promotions() {

    return (
        <div className="container flex flex-col justify-center mx-auto ">
            <h2 className="inline-block px-6 py-2 mx-auto text-2xl font-bold text-center text-white bg-gray-700 border-b-4 border-orange-500 rounded-t-lg md:text-3xl">
                Promociones financieras
            </h2>
            <div className="w-full h-5 mb-4 bg-gray-700"></div>

            <div className="mx-auto px-50">
                <div className="w-full">
                    <img
                        src="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/public/images/tarjetas.webp"
                        className="object-contain w-full h-auto"
                        alt="Promociones"
                    />
                </div>
            </div>
        </div>
    );
}