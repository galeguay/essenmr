export default function ProductLineCard({ productLine }){
    
    
    return(
        <a 
        href={`/catalogo?product_line=${productLine.name}`}
        className="flex flex-col items-center gap-2 pt-4 bg-white rounded shadow-sm hover:shadow-lg w-30 h-34">
            {/* Imágen */}
            <div className="w-16 h-16 bg-gray-200">
                {productLine.image}
            </div>
            {/* Nombre */}
            <div className="flex justify-center">
                {productLine.name}
            </div>
        </a>
    )
}