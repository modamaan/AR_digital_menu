/**
 * DUMMY 3D MODEL CONFIG
 * ---------------------
 * When USE_DUMMY_3D=true in .env.local, uploads instantly return a pre-set
 * GLB instead of calling the real Modal AI pipeline (which takes 1–3 min).
 *
 * HOW TO ADD YOUR OWN PAIRS:
 *  1. Add an entry to `DUMMY_MODELS` below with:
 *      - imagePattern: a keyword in the uploaded filename (case-insensitive)
 *      - glbUrl: a public URL to your .glb file
 *      - label: friendly name (used for logs only)
 *  2. If none of the patterns match the filename, the FALLBACK_GLB is used.
 *
 * EXAMPLE:
 *  { imagePattern: 'burger',  glbUrl: 'https://...burger.glb',  label: 'Burger'  },
 *  { imagePattern: 'pizza',   glbUrl: 'https://...pizza.glb',   label: 'Pizza'   },
 *  { imagePattern: 'biryani', glbUrl: 'https://...biryani.glb', label: 'Biryani' },
 */

export interface DummyModel {
    imagePattern: string; // keyword to match in uploaded filename (empty = fallback)
    glbUrl: string;       // public .glb URL
    label: string;        // friendly name for logs
}

// ── ADD YOUR IMAGE→GLB PAIRS HERE ────────────────────────────────────────────
export const DUMMY_MODELS: DummyModel[] = [
    {
        label: 'Pizza',
        imagePattern: 'pizza',
        glbUrl: '/uploads/models/pizza.glb',
    },
    {
        label: 'Burger',
        imagePattern: 'burger',
        glbUrl: '/uploads/models/burger.glb',
    },
    {
        label: 'ice cream',
        imagePattern: 'ice cream',
        glbUrl: '/uploads/models/ice_cream.glb',
    }
    // Add more pairs here:
    // { label: 'Burger', imagePattern: 'burger', glbUrl: '/uploads/models/burger.glb' },
    // { label: 'Biryani', imagePattern: 'biryani', glbUrl: '/uploads/models/biryani.glb' },
];

// ── FALLBACK: used when no imagePattern matches ───────────────────────────────
// Any upload that doesn't match a pattern above will use this GLB
export const FALLBACK_GLB = '/uploads/models/pizza.glb';

// ── SIMULATED DELAY (ms) — makes it feel like something is happening ──────────
export const DUMMY_DELAY_MS = 1500;

// ── Helper: pick the right dummy GLB for a given filename ────────────────────
export function getDummyGlbUrl(filename: string): string {
    // Normalize: lowercase + remove spaces, underscores, hyphens
    // So 'ice cream', 'ice_cream', 'icecream' all match each other
    const normalize = (s: string) => s.toLowerCase().replace(/[\s_-]/g, '');
    const normalizedFilename = normalize(filename);

    for (const model of DUMMY_MODELS) {
        if (model.imagePattern && normalizedFilename.includes(normalize(model.imagePattern))) {
            console.log(`[Dummy 3D] Matched "${model.label}" for filename: ${filename}`);
            return model.glbUrl;
        }
    }
    console.log(`[Dummy 3D] No pattern matched for "${filename}", using fallback`);
    return FALLBACK_GLB;
}
