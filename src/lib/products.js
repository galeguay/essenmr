import { supabase } from "./supabase";
import { storagePathFromUrl } from "../utils/storagePath";

const PRODUCTS_BUCKET = "products";

// Busca un producto que ya use el código. Devuelve { id, name } o null.
// excludeId permite ignorar al propio producto al editar. Lanza error si la consulta falla.
export async function findProductByCode(code, excludeId = null) {
    let query = supabase
        .from("products")
        .select("id, name")
        .eq("essen_id", Number(code));

    if (excludeId) query = query.neq("id", excludeId);

    const { data, error } = await query.limit(1).maybeSingle();
    if (error) throw error;
    return data;
}

// ¿Algún producto usa esta URL en sus campos de archivos? Lanza error si la consulta falla.
async function isFileUsedByAnotherProduct(url) {
    const { data, error } = await supabase
        .from("products")
        .select("id")
        .or(`image.eq."${url}",info_pdf.eq."${url}",video_url.eq."${url}",images.cs.{"${url}"}`)
        .limit(1);

    if (error) throw error;
    return data.length > 0;
}

// Elimina el producto y, después, los archivos subidos que tenía registrados en la base.
// Devuelve { status: "deleted" | "not_found", failedFiles }. Lanza error si no se pudo
// borrar el producto (en ese caso no se toca ningún archivo).
export async function deleteProductWithFiles(id) {
    const { data: row, error: readError } = await supabase
        .from("products")
        .select("id, image, info_pdf, video_url, images")
        .eq("id", id)
        .maybeSingle();

    if (readError) throw readError;
    if (!row) return { status: "not_found", failedFiles: 0 };

    // Con RLS, un borrado denegado no da error: devuelve cero filas.
    const { data: deleted, error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .select("id");

    if (deleteError) throw deleteError;

    if (deleted.length === 0) {
        const { data: stillThere, error: recheckError } = await supabase
            .from("products")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        if (recheckError) throw recheckError;
        if (stillThere) throw new Error("No se pudo eliminar el producto (sin permiso).");
        return { status: "not_found", failedFiles: 0 };
    }

    // Archivos del bucket (los enlaces externos y los vacíos quedan afuera), sin repetir.
    const filesByPath = new Map();
    for (const url of [row.image, row.info_pdf, row.video_url, ...(row.images || [])]) {
        const path = storagePathFromUrl(url, PRODUCTS_BUCKET);
        if (path && !filesByPath.has(path)) filesByPath.set(path, url);
    }

    let failedFiles = 0;
    const pathsToRemove = [];

    for (const [path, url] of filesByPath) {
        try {
            // El producto ya no existe, así que cualquier coincidencia es de otro producto.
            if (!(await isFileUsedByAnotherProduct(url))) pathsToRemove.push(path);
        } catch (error) {
            console.error("No se pudo verificar si el archivo lo usa otro producto:", path, error);
            failedFiles++;
        }
    }

    if (pathsToRemove.length > 0) {
        const { data: removed, error: removeError } = await supabase.storage
            .from(PRODUCTS_BUCKET)
            .remove(pathsToRemove);

        if (removeError) {
            console.error("Error borrando archivos del producto:", removeError);
            failedFiles += pathsToRemove.length;
        } else {
            // Un borrado denegado por RLS no da error: devuelve menos archivos de los pedidos.
            failedFiles += pathsToRemove.length - removed.length;
        }
    }

    return { status: "deleted", failedFiles };
}
