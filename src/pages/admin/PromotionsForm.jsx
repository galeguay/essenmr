import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PromotionsForm() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState("");

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        const fileName = `tarjetas.webp`;
        const { data, error } = await supabase.storage
            .from("images")
            .upload(fileName, file, {
                upsert: true
            });

        if (error) {
            console.error(error);
            setLoading(false);
            return;
        }

        const { data: publicUrlData } = supabase.storage
            .from("images")
            .getPublicUrl(data.path);

        setUrl(publicUrlData.publicUrl);
        setLoading(false);
    };

    return (
        <div className="">

            <div className="max-w-md p-6 mx-auto space-y-4 shadow bg-base-200 rounded-2xl">
                <h2 className="mb-4 text-xl font-bold">Promociones Financieras</h2>

                <form onSubmit={handleUpload} className="max-w-md p-6 mx-auto space-y-4 shadow bg-base-200 rounded-2xl">
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full file-input file-input-bordered"
                        onChange={(e) => setFile(e.target.files[0])}
                    />

                    <button
                        type="submit"
                        className="w-full btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Subiendo..." : "Cargar Imagen"}
                    </button>
                </form>
            </div>

            <div className="max-w-2xl mx-auto hadow bg-base-200 rounded-2xl">
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