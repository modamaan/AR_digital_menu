import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Get the secret token from the request
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        // Verify the secret token (prevent unauthorized revalidation)
        if (token !== process.env.REVALIDATION_SECRET) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Get the paths to revalidate from the request body
        const body = await request.json();
        const { paths } = body;

        if (!paths || !Array.isArray(paths)) {
            return NextResponse.json(
                { error: 'Paths array is required' },
                { status: 400 }
            );
        }

        // Revalidate each path
        for (const path of paths) {
            revalidatePath(path);
        }

        return NextResponse.json({
            success: true,
            revalidated: paths,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Revalidation error:', error);
        return NextResponse.json(
            { error: 'Failed to revalidate' },
            { status: 500 }
        );
    }
}
