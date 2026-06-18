import { Helmet } from 'react-helmet-async';

export default function Seo({ title, description, keywords, type, image, canonical, jsonLd }) {
  // Valores por defecto por si alguna vista no pasa las props
  const siteTitle = title || 'EssenMR - Mar del Plata';
  const defaultDescription = 'EssenMR emprendedora oficial Essen en Mar del Plata con envíos a todo el país. Descubrí ofertas, promociones y novedades de sartenes, ollas y utensilios de cocina.';
  const defaultKeywords = 'Essen, cocina, Mar del Plata, ollas, sartenes, baterías de cocina, promociones, envíos';
  
  // Reemplazá esto por tu dominio real cuando lo tengas
  const baseUrl = 'https://tudominio.com'; 

  return (
    <Helmet>
      {/* Etiquetas estándar */}
      <title>{siteTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      {/* Canonical */}
      {canonical && <link rel="canonical" href={`${baseUrl}${canonical}`} />}
      
      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      {image && <meta property="og:image" content={image} />}
      {canonical && <meta property="og:url" content={`${baseUrl}${canonical}`} />}
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD Schema (Datos estructurados para Google) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}