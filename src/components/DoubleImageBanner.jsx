export default function DoubleImageBanner({
    image1 = "https://via.placeholder.com/400x300",
    image2 = "https://via.placeholder.com/400x300",
    alt1 = "Imagen 1",
    alt2 = "Imagen 2",
    bgColor = "#ffffff",
}) {
    return (
        <section
            className="w-full my-4"
            style={{ backgroundColor: bgColor }}
        >
            <div className="flex flex-col w-full md:flex-row">

                {/* Imagen Izquierda: Alineada a la derecha en desktop */}
                <div className="flex w-full md:w-1/2 md:justify-end">
                    <img
                        src={image1}
                        alt={alt1}
                        className="object-cover w-full md:w-auto md:max-w-full"
                    />
                </div>

                {/* Imagen Derecha: Alineada a la izquierda en desktop */}
                <div className="flex w-full md:w-1/2 md:justify-start">
                    <img
                        src={image2}
                        alt={alt2}
                        className="object-cover w-full md:w-auto md:max-w-full"
                    />
                </div>

            </div>
        </section>
    );
}