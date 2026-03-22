import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const maxDuration = 60; // optionally increase timeout
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const fileNameHeader = req.headers.get('x-file-name');
        if (!fileNameHeader) {
            return NextResponse.json({ error: 'Missing x-file-name header' }, { status: 400 });
        }

        const fileName = `${Date.now()}-${decodeURIComponent(fileNameHeader).replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const arrayBuffer = await req.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'models');
        await mkdir(uploadDir, { recursive: true });

        const filePath = join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            url: `/uploads/models/${fileName}`,
        });
    } catch (err) {
        console.error('GLB local upload error:', err);
        return NextResponse.json({ error: 'Failed to upload local GLB file' }, { status: 500 });
    }
}
