export default function ProductLineCard({ productLine }) {


    return (
        <a
            href={`/catalogo?product_line=${productLine.name}`}
            className="flex flex-col items-center h-40 gap-2 pt-4 bg-white rounded shadow-sm w-30 hover:shadow-lg">
            {/* Imágen */}
            <div className="w-20 h-20 bg-gray-200">
                {productLine.image}
            </div>
            {/* Nombre */}
            <div className="flex justify-center text-center">
                {productLine.name}
            </div>
        </a>
    )
}