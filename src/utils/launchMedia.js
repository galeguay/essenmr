// Un producto tiene contenido de lanzamiento si tiene ficha PDF o video
export const hasLaunchMedia = (product) => Boolean(product?.info_pdf || product?.video_url);
