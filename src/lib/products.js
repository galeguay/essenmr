import { supabase } from "./supabase";

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
