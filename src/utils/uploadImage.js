import { supabase } from "../lib/supabase";

export async function uploadImage(bucketName, file, essenId) {
  if (!file) return null;

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
