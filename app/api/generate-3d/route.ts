import { NextRequest, NextResponse } from 'next/server';
import { getDummyGlbUrl, DUMMY_DELAY_MS } from '@/lib/config/dummy-3d-models';

const MODAL_GENERATE_URL = process.env.MODAL_GENERATE_URL;
const USE_DUMMY_3D = process.env.USE_DUMMY_3D === 'true';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File | null;
        const outputName = (formData.get('output_name') as string) || 'model.glb';
        const removeBg = formData.get('remove_bg') !== 'false';

        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // ── DUMMY MODE ───────────────────────────────────────────────────────
        // Returns a pre-configured GLB instantly — no Modal call, no GPU cost.
        // Enable by setting USE_DUMMY_3D=true in .env.local
        if (USE_DUMMY_3D) {
            console.log('[Dummy 3D] Dummy mode active — skipping Modal');
            await new Promise(r => setTimeout(r, DUMMY_DELAY_MS));
            const glbUrl = getDummyGlbUrl(file.name);
            return NextResponse.json({
                success: true,
                glb_filename: outputName,
                glb_url: glbUrl,
                glb_b64: null,
                total_time_seconds: (DUMMY_DELAY_MS / 1000).toFixed(1),
                file_size_mb: 0,
                dummy: true,
            });
        }
        // ────────────────────────────────────────────────────────────────────

        if (!MODAL_GENERATE_URL) {
            return NextResponse.json(
                { error: 'MODAL_GENERATE_URL is not configured in .env.local' },
                { status: 500 }
            );
        }

        // Convert image file to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Call Modal endpoint
        const modalResponse = await fetch(MODAL_GENERATE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_b64: base64,
                output_name: outputName,
                remove_bg: removeBg,
            }),
            signal: AbortSignal.timeout(900_000), // 15 min max
        });

        if (!modalResponse.ok) {
            const errorText = await modalResponse.text();
            console.error('Modal error:', errorText);
            return NextResponse.json(
                { error: 'Modal generation failed', details: errorText },
                { status: 500 }
            );
        }

        const result = await modalResponse.json();

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || '3D generation failed' },
                { status: 500 }
            );
        }

        // Build the public serve URL for the GLB
        const MODAL_SERVE_BASE_URL = process.env.MODAL_SERVE_BASE_URL;
        const glbUrl = MODAL_SERVE_BASE_URL
            ? `${MODAL_SERVE_BASE_URL}?filename=${encodeURIComponent(result.glb_filename)}`
            : null;

        return NextResponse.json({
            success: true,
            glb_filename: result.glb_filename,
            glb_url: glbUrl,
            glb_b64: result.glb_b64,
            total_time_seconds: result.total_time_seconds,
            file_size_mb: result.file_size_mb,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('generate-3d error:', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

