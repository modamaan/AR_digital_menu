import { NextRequest, NextResponse } from 'next/server';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

export async function POST(req: NextRequest) {
    if (!IMGBB_API_KEY) {
        return NextResponse.json(
            { error: 'IMGBB_API_KEY is not set in .env.local. Get a free key at imgbb.com/api' },
            { status: 500 }
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Convert to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Upload to imgBB
        const params = new URLSearchParams({ image: base64 });
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: params,
        });

        const data = await response.json();

        if (!data.success) {
            return NextResponse.json(
                { error: data.error?.message || 'imgBB upload failed' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            url: data.data.url,          // direct image URL
            display_url: data.data.display_url,
            delete_url: data.data.delete_url,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
