import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import PageTitle from "../../components/public/PageTitle";

export default function FaqList() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFaqs();
    }, []);

    const loadFaqs = async () => {
        const { data, error } = await supabase
            .from("faqs")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error("Error cargando FAQs:", error);
        } else {
            setFaqs(data);
        }

        setLoading(false);
    };

    if (loading) return <p>Cargando FAQs...</p>;

    return (
        <div className="min-h-screen px-4 py-8 bg-gray-50">
            <div className="mx-auto max-w-7xl">
                <PageTitle title="Preguntas frecuentes" />
                <div className="space-y-4">
                    {faqs.map((item) => (
                        <div key={item.id} className="shadow collapse collapse-arrow bg-base-300">
                            <input type="checkbox" />
                            <div className="text-lg font-medium collapse-title">
                                {item.question}
                            </div>
                            <div className="collapse-content">
                                <p>{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}
