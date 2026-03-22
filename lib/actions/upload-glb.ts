'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function uploadGlbAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        if (!file.name.endsWith('.glb')) {
            return { success: false, error: 'File must be a .glb file' };
        }

        // Convert the File object into a Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Ensure the upload directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'models');
        await mkdir(uploadDir, { recursive: true });

        // Save file locally
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        return { success: true, url: `/uploads/models/${fileName}` };
    } catch (error) {
        console.error('GLB local upload error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
