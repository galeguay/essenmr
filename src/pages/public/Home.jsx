import { useState, useEffect } from 'react';
import ProductLineCard from '../../components/ProductLineCard';
import Promotions from '../../components/Promotions';
import { supabase } from '../../lib/supabase';
import BtnWpp from '../../components/BtnWpp';
import NewReleaseCard from '../../components/NewReleaseCard';
import ProductCard from '../../components/ProductCard';
import AnnouncementBanner from '../../components/AnnouncementBanner';
import Title from '../../components/Title';
import HeroFusionBanner from '../../components/HeroFusionBanner';
import Seo from '../../components/Seo';
import { typography } from '../../styles/typography';

const formatExpirationDateForBanner = (dateString) => {
    if (!dateString) return undefined;

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return undefined;

    const pad = (value) => String(value).padStart(2, '0');

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}-${month}-${year}`;
};

export default function Home() {

    const [productLines, setProductLines] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = async () => {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) throw error;

            const now = new Date();

            const activeAnnouncements = (data || []).filter((announcement) => {
                const startsAtIsValid =
                    !announcement.starts_at || new Date(announcement.starts_at) <= now;

                const expirationDateIsValid =
                    !announcement.expiration_date || new Date(announcement.expiration_date) > now;

                return startsAtIsValid && expirationDateIsValid;
            });

            setAnnouncements(activeAnnouncements);
        } catch (err) {
            console.error('Error fetching announcements:', err);
        }
    };

    const fetchDiscounts = async () => {
        try {
            const queryDiscounts = supabase
                .from('products')
                .select(`*, product_line (*)`)
                .gt('discount', 0)
                .eq('is_visible', true)
                .order('discount', { ascending: false });

            const queryCombos = supabase
                .from('products')
                .select(`*, product_line!inner (*)`)
                .eq('is_visible', true)
                .ilike('product_line.name', '%Combos%');

            const [resDiscounts, resCombos] = await Promise.all([queryDiscounts, queryCombos]);

            if (resDiscounts.error) throw resDiscounts.error;
            if (resCombos.error) throw resCombos.error;

            const discountsData = resDiscounts.data || [];
            const combosData = resCombos.data || [];

            const combined = [...discountsData];
            const existingIds = new Set(combined.map(p => p.id));

            combosData.forEach(p => {
                if (!existingIds.has(p.id)) {
                    combined.push(p);
                }
            });

            setDiscounts(combined);

        } catch (err) {
            console.error('Error fetching discounts/combos:', err);
        }
    };

    const fetchNewProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`*, product_line (*)`)
                .eq('is_new', true)
                .eq('is_visible', true);

            if (error) throw error;

            setNewProducts(data || []);
        } catch (err) {
            console.error('Error fetching new products:', err);
        }
    };

    const fetchProductLines = async () => {
        try {
            const { data, error } = await supabase
                .from('product_lines')
                .select('*')
                .eq('is_visible', true)
                .order('name', { ascending: true });

            if (error) throw error;

            setProductLines(data || []);
        } catch (err) {
            console.error('Error fetching product lines:', err);
            alert('Error al cargar las líneas de productos');
        }
    };

    useEffect(() => {
        setLoading(true);

        Promise.all([
            fetchProductLines(),
            fetchNewProducts(),
            fetchDiscounts(),
            fetchAnnouncements()
        ]).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading) {
            const hash = window.location.hash;

            if (hash) {
                setTimeout(() => {
                    const element = document.querySelector(hash);

                    if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                    }
                }, 300);
            }
        }
    }, [loading]);

    const getGridClasses = (length) => {
        if (length === 1) return "grid-cols-1";
        if (length === 2) return "grid-cols-1 md:grid-cols-2";
        if (length === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    };

    return (
        <>
            <Seo
                title="EssenMR - Ofertas y novedades en productos de cocina Essen"
                description="Encontrá combos, promociones y nuevos lanzamientos de productos Essen en Mar del Plata con envío a todo el país."
                image="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/images/plan_canje.webp"
                keywords="Essen, productos Essen, ollas, sartenes, Mar del Plata, promociones, combos"
            />

            <div className="">

                <HeroFusionBanner
                    title="Combos Mundiales 🇦🇷"
                    titleColor="text-white"
                    text="Con la compra de productos seleccionados podés acceder a la SARTÉN 18 CM ARGENTINA mundial."
                    textColor="text-white"
                    image="https://cgncsclwhqvwxytoibyw.supabase.co/storage/v1/object/images/sarten_18_arg.webp"
                    link="/producto/38651903"
                    backgroundColor="bg-sky-500"
                >
                    <BtnWpp
                        message="¡Hola! Vi el anuncio del HOT ESSEN en la página y quiero saber más."
                    />
                </HeroFusionBanner>

                {announcements.map((announcement) => (
                    <AnnouncementBanner
                        key={announcement.id}
                        title={announcement.title || undefined}
                        titleClassName={announcement.title_class_name || undefined}
                        titleTop={announcement.title_top ? "true" : undefined}
                        image={announcement.image_url}
                        expirationDate={formatExpirationDateForBanner(announcement.expiration_date)}
                        bgColor={announcement.bg_color || undefined}
                        className={announcement.class_name || undefined}
                    />
                ))}

                <section className="flex flex-col items-center justify-center w-full py-12 bg-green-200">
                    <div className={`grid gap-3 px-6 md:px-16 justify-center container ${getGridClasses(discounts.length)}`}>
                        {discounts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                </section>

                <section className="flex flex-col items-center py-12">
                    <h2 className={`${typography.sectionTitle} mb-10`}>
                        Lineas de productos
                    </h2>

                    <div className="flex w-full justify-center bg-gray-100 shadow-[inset_0_10px_10px_-10px_rgba(0,0,0,0.35),inset_0_-10px_10px_-10px_rgba(0,0,0,0.35)]">
                        <div className="container lg:flex lg:justify-center ">
                            <div className="flex justify-around gap-2 py-6 overflow-x-auto lg:overflow-x-visible xl:w-full">
                                {productLines.map((line) => (
                                    <div key={line.id} className="min-w-[40%] sm:min-w-[35%] md:min-w-[18%] lg:min-w-0">
                                        <ProductLineCard productLine={line} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="flex flex-wrap items-center justify-center pt-4 pb-16 space-y-2 md:space-y-0 md:space-x-6">
                    <div className="flex flex-wrap items-center justify-center mb-5 md:mb-0">
                        <i className="text-2xl bi bi-credit-card me-2"></i>
                        Aceptamos todos los medios de pagos.

                        <a
                            href="#promociones"
                            className="flex underline ps-1 me-3"
                            onClick={(e) => {
                                e.preventDefault();

                                document.getElementById('promociones')?.scrollIntoView({
                                    behavior: 'smooth'
                                });
                            }}
                        >
                            Ver promociones financieras
                        </a>
                    </div>

                    <div className="flex items-center">
                        <i className="text-2xl bi bi-box-seam me-2"></i>
                        Envíos a todo el país
                    </div>
                </section>

                {newProducts.length > 0 ? (
                    <section className="py-12 bg-black">
                        <h2 className={`${typography.sectionTitle} text-center text-white mb-10`}>
                            Nuevos productos
                        </h2>

                        <div className="container mx-auto">
                            <div className="flex flex-col items-center gap-8 px-6">
                                {newProducts.map((np) => (
                                    <NewReleaseCard
                                        key={np.essen_id}
                                        productId={np.essen_id}
                                        title={np.name}
                                        image={np.image}
                                        description={np.description}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                ) : ""}

                <div id="promociones" className="my-12">
                    <Promotions />
                </div>

            </div>
        </>
    );
}