import { supabase } from "../lib/supabase";
import { storagePathFromUrl } from "./storagePath";

export async function uploadImage(bucketName, file, essenId) {
  if (!file) return null;

  // Obtiene extensión del archivo
  const ext = file.name.split(".").pop().toLowerCase();

  // Nombre único por subida: la URL cambia al reemplazar el archivo, así la caché
  // larga del navegador/CDN no sirve versiones viejas y no hace falta recargar recursos
  const fileName = `${essenId}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// Borra del bucket los archivos que estaban guardados antes y ya no se usan
// (reemplazados o quitados). Llamar DESPUÉS de guardar en la base: si algo falla
// acá solo queda un archivo huérfano, nunca un registro con un enlace roto.
// isUsedElsewhere(url) permite conservar archivos que otro registro sigue usando.
export async function removeReplacedFiles(bucketName, previousUrls, currentUrls, isUsedElsewhere) {
  const keep = new Set(currentUrls.filter(Boolean));
  const paths = new Map();

  for (const url of previousUrls) {
    if (!url || keep.has(url)) continue;
    const path = storagePathFromUrl(url, bucketName);
    if (!path || paths.has(path)) continue;

    try {
      if (isUsedElsewhere && (await isUsedElsewhere(url))) continue;
      paths.set(path, url);
    } catch (error) {
      console.error("No se pudo verificar si el archivo sigue en uso:", path, error);
    }
  }

  if (paths.size === 0) return;

  const { error } = await supabase.storage.from(bucketName).remove([...paths.keys()]);
  if (error) console.error("No se pudieron borrar archivos viejos:", error);
}
