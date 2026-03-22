import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // Clear the session cookie
        const cookieStore = await cookies();
        cookieStore.delete('session');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error signing out:', error);
        return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
    }
}
