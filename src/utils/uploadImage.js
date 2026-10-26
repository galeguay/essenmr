import { supabase } from "../lib/supabase";

const MB = 1024 * 1024;

// Tipos y tamaños permitidos. Coinciden con los límites de los buckets de Storage
// (sql/2026-10-26_storage_bucket_limits.sql): el bucket es lo que realmente los impone,
// esto solo da un error claro antes de subir.
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const BUCKET_RULES = {
  images: { types: IMAGE_TYPES, maxSize: 5 * MB },
  products: { types: [...IMAGE_TYPES, "application/pdf", ...VIDEO_TYPES], maxSize: 50 * MB },
  product_lines: { types: [...IMAGE_TYPES, ...VIDEO_TYPES], maxSize: 50 * MB },
};

// Lanza un Error con mensaje legible si el archivo no cumple las reglas del bucket.
export function validateUpload(bucketName, file) {
  const rules = BUCKET_RULES[bucketName];
  if (!rules) throw new Error(`Bucket desconocido: ${bucketName}`);

  if (!rules.types.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido (${file.type || "desconocido"}).`);
  }
  if (file.size > rules.maxSize) {
    throw new Error(`El archivo supera el máximo de ${rules.maxSize / MB} MB.`);
  }
}

export async function uploadImage(bucketName, file, essenId) {
  if (!file) return null;

  validateUpload(bucketName, file);

  // Obtiene extensión del archivo
  const ext = file.name.split(".").pop().toLowerCase();

  const fileName = `${essenId}.${ext}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return data.publicUrl;
}
