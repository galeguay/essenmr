import { Fragment, useEffect, useRef } from 'react';
import Promotions from '../../components/Promotions';
import useHomeLoad from '../../hooks/useHomeLoad';
import useHomeScroll from '../../hooks/useHomeScroll';
import PageLoader from '../../components/PageLoader';
import usePageLoader from '../../hooks/usePageLoader';
import NewReleaseCard from '../../components/NewReleaseCard';
import ProductCard from '../../components/ProductCard';
import AnnouncementBanner from '../../components/AnnouncementBanner';
import Title from '../../components/Title';
import HeroFusionBanner from '../../components/HeroFusionBanner';
import Seo from '../../components/Seo';
import ContactCard from '../../components/ContactCard';
import CtaCard from '../../components/CtaCard';
import DecorPills from '../../components/DecorPills';
import Reveal from '../../components/Reveal';
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
    const contentRef = useRef(null);
    const { data, phase } = useHomeLoad(contentRef);
    const { announcements, discounts, newProducts } = data;
    const loading = phase === 'loading';
    const showLoader = usePageLoader(loading);

    useHomeScroll(phase);

    // Mientras la capa de carga está visible no se puede hacer scroll.
    useEffect(() => {
        if (!showLoader) return;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [showLoader]);

    const getGridClasses = (length) => {
        if (length === 1) return "grid-cols-1 max-w-md mx-auto w-full";
        if (length === 2) return "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto";
        if (length === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto";
        if (length === 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
        if (length === 5) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-5";
        if (length === 6) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
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

            <PageLoader visible={showLoader} />

            <div ref={contentRef} className={loading ? 'opacity-0' : ''} inert={loading}>

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

                <section className="flex flex-col items-center justify-center py-12 bg-stone-50">
                    <Reveal effect="left" className="container mx-auto">
                        <h2 className={`${typography.sectionTitle} text-dark px-6 md:px-16 mb-10 flex items-center gap-4 lg:gap-6`}>
                            Descuentos
                            <span className="flex items-center flex-1 gap-2 lg:gap-3" aria-hidden="true">
                                <span className="h-1.5 lg:h-2 flex-1 rounded-full bg-stone-200"></span>
                                <span className="w-6 h-1.5 lg:w-10 lg:h-2 rounded-full bg-orange-200"></span>
                                <span className="w-3 h-1.5 lg:w-4 lg:h-2 rounded-full bg-orange-300"></span>
                            </span>
                        </h2>
                    </Reveal>
                    <div className={`grid gap-3 px-6 md:px-16 justify-center container ${getGridClasses(discounts.length)}`}>
                        {discounts.map((product, index) => (
                            <Reveal key={product.id} effect="zoom" delay={Math.min((index % 4) * 100, 400)} className="h-full">
                                <ProductCard product={product} className="h-full" />
                            </Reveal>
                        ))}
                    </div>
                </section>

                {newProducts.length > 0 ? (
                    <section className="py-12 bg-orange-50 overflow-x-clip">

                        <Reveal effect="left" className="container mx-auto">
                            <h2 className={`${typography.sectionTitle} text-orange-800 px-6 md:px-16 lg:pl-40 mb-10 flex items-center gap-3 lg:gap-4`}>
                                <span className="hidden lg:block lg:h-2 lg:w-24 shrink-0 rounded-full bg-orange-300" aria-hidden="true"></span>
                                Novedades del mes
                            </h2>
                        </Reveal>

                        <div className="container mx-auto">
                            <div className="flex flex-col items-center gap-4 px-6 lg:px-16 lg:gap-12">
                                {newProducts.map((np, index) => (
                                    <Fragment key={np.essen_id}>
                                    <Reveal
                                        effect={index % 2 === 1 ? "right" : "left"}
                                        className={`relative flex justify-center w-full ${index % 2 === 1 ? "lg:justify-start" : "lg:justify-end"}`}
                                    >
                                        <DecorPills
                                            tone={index % 2 === 1 ? "stone" : "orange"}
                                            className={`absolute top-1/2 -translate-y-1/2 ${index % 2 === 1 ? "left-full ms-8" : "right-full me-8 items-end"}`}
                                        />
                                        <NewReleaseCard
                                            productId={np.essen_id}
                                            title={np.name}
                                            image={np.image}
                                            description={np.description}
                                            isNew={np.is_new}
                                            productLine={np.product_line?.name}
                                            reverse={index % 2 === 1}
                                        />
                                    </Reveal>
                                    {index < newProducts.length - 1 && (
                                        <div
                                            className={`flex gap-2 lg:hidden ${index % 2 === 1 ? "self-start" : "self-end"}`}
                                            aria-hidden="true"
                                        >
                                            <span className="w-3 h-1.5 rounded-full bg-orange-300/70"></span>
                                            <span className="w-10 h-1.5 rounded-full bg-orange-200"></span>
                                            <span className="w-6 h-1.5 rounded-full bg-orange-100"></span>
                                        </div>
                                    )}
                                    </Fragment>
                                ))}
                            </div>
                        </div>
                    </section>
                ) : ""}

                <section className="py-12">
                    <div className="flex items-center justify-center gap-2 px-6 mb-8 lg:gap-3 lg:mb-12" aria-hidden="true">
                        <span className="w-14 h-1.5 lg:w-40 lg:h-2 rounded-full bg-orange-100"></span>
                        <span className="w-8 h-1.5 lg:w-16 lg:h-2 rounded-full bg-orange-200"></span>
                        <span className="w-3 h-1.5 lg:w-4 lg:h-2 rounded-full bg-orange-300"></span>
                        <span className="w-8 h-1.5 lg:w-16 lg:h-2 rounded-full bg-orange-200"></span>
                        <span className="w-14 h-1.5 lg:w-40 lg:h-2 rounded-full bg-orange-100"></span>
                    </div>
                    <div className="container grid gap-6 px-6 mx-auto md:grid-cols-2 md:px-16 lg:max-w-4xl">
                        <Reveal effect="up" className="h-full">
                        <CtaCard
                            square
                            className="h-full"
                            icon="bi-grid-fill"
                            title="Conocé nuestras líneas de productos"
                            buttonLabel="Ver el catálogo →"
                            to="/catalogo"
                        />
                        </Reveal>
                        <Reveal effect="up" delay={150} className="h-full">
                            <ContactCard gaAction="Clic_Contacto_Home" text="" square className="h-full" />
                        </Reveal>
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

                <div>
                    <Promotions />
                </div>

            </div>
        </>
    );
}