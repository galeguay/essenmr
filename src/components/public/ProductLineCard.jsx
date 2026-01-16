export default function ProductLineCard({ productLine }) {


    return (
        <a
            href={`/catalogo?product_line=${productLine.name}`}
            className="flex flex-col items-center h-40 gap-2 pt-4 bg-white rounded shadow-sm w-30 hover:shadow-lg">
            <div className="w-20 h-20">
                <div className="relative flex items-center justify-center aspect-square">
                {productLine.image ? (
                    <img
                        loading="lazy"
                        src={productLine.image}
                        alt={productLine.name}
                        className="absolute inset-0 object-cover w-full h-full"
                        onError={(e) => {
                            e.currentTarget.src = "../../cacerola.webp";
                        }}
                    />
                ) : (
                    <img
                        loading="lazy"
                        src="../../cacerola.webp"
                        alt={productLine.name}
                        className="absolute inset-0 object-cover w-full h-full p-4"
                    />
                )}
                </div>
            </div>
            {/* Nombre */}
            <div className="flex justify-center text-center px-2">
                {productLine.name}
            </div>
        </a>
    )
}