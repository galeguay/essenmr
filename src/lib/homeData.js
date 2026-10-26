import { supabase } from './supabase';

const CACHE_KEY = 'essenmr:home:v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

let memoryCache = null;

const isAnnouncementActive = (announcement, now) => {
    const startsAtIsValid =
        !announcement.starts_at || new Date(announcement.starts_at) <= now;

    const expirationDateIsValid =
        !announcement.expiration_date || new Date(announcement.expiration_date) > now;

    return startsAtIsValid && expirationDateIsValid;
};

const fetchAnnouncements = async () => {
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

const fetchDiscounts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select(`*, product_line (*)`)
        .gt('discount', 0)
        .eq('is_visible', true)
        .order('discount', { ascending: false });

    if (error) throw error;
    return data || [];
};

const fetchNewProducts = async () => {
    const queryNew = supabase
        .from('products')
        .select(`*, product_line (*)`)
        .eq('is_new', true)
        .eq('is_visible', true);

    const queryCombos = supabase
        .from('products')
        .select(`*, product_line!inner (*)`)
        .eq('is_visible', true)
        .ilike('product_line.name', '%Combos%');

    const [resNew, resCombos] = await Promise.all([queryNew, queryCombos]);

    if (resNew.error) throw resNew.error;
    if (resCombos.error) throw resCombos.error;

    const combined = [...(resNew.data || [])];
    const existingIds = new Set(combined.map((p) => p.id));

    (resCombos.data || []).forEach((p) => {
        if (!existingIds.has(p.id)) combined.push(p);
    });

    return combined;
};

// Los anuncios vencidos se filtran al leer, no al guardar, para que no reaparezcan desde el caché.
const withActiveAnnouncements = (raw) => ({
    ...raw,
    announcements: raw.announcements.filter((a) => isAnnouncementActive(a, new Date())),
});

// Devuelve los datos cacheados (memoria o sessionStorage) si siguen vigentes, o null.
export function readHomeCache() {
    let cached = memoryCache;

    if (!cached) {
        try {
            const stored = sessionStorage.getItem(CACHE_KEY);
            if (stored) cached = JSON.parse(stored);
        } catch {
            cached = null;
        }
    }

    if (!cached || Date.now() - cached.savedAt > CACHE_TTL_MS) return null;

    memoryCache = cached;
    return withActiveAnnouncements(cached);
}

const saveHomeCache = (raw) => {
    const cached = { ...raw, savedAt: Date.now() };
    memoryCache = cached;

    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {
        // sessionStorage no disponible: queda solo el caché en memoria.
    }
};

// Pide las tres listas en paralelo. Una consulta fallida deja su lista vacía sin bloquear a las otras.
export async function loadHomeData() {
    const names = ['announcements', 'discounts', 'newProducts'];
    const results = await Promise.allSettled([
        fetchAnnouncements(),
        fetchDiscounts(),
        fetchNewProducts(),
    ]);

    const raw = {};
    let allOk = true;

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            raw[names[index]] = result.value;
        } else {
            allOk = false;
            raw[names[index]] = [];
            console.error(`Error fetching ${names[index]}:`, result.reason);
        }
    });

    if (allOk) saveHomeCache(raw);

    return { ...withActiveAnnouncements(raw), allOk };
}
