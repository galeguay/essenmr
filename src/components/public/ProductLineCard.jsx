export default function ProductLineCard({ productLine }){
    
    
    return(
        <a 
        href={`/catalogo/${productLine.string_id}`}
        className="flex flex-col items-center shadow-sm bg-white hover:shadow-lg rounded w-30 h-34 pt-4 gap-2">
            {/* Imágen */}
            <div className="h-16 w-16 bg-gray-200">
                {productLine.image}
            </div>
            {/* Nombre */}
            <div className="flex justify-center">
                {productLine.name}
            </div>
        </a>
    )
}