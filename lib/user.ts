import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get user from database by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, clerkId),
        });

        return user;
    } catch (error) {
        console.error('Error fetching user by Clerk ID:', error);
        return null;
    }
}

/**
 * Get the current authenticated user from the database
 */
export async function getCurrentUser() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return null;
        }

        // Get user from database
        const user = await getUserByClerkId(userId);
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Get the current user's Clerk ID
 */
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const { userId } = await auth();
        return userId || null;
    } catch (error) {
        console.error('Error getting current user ID:', error);
        return null;
    }
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    try {
        const { userId } = await auth();
        return !!userId;
    } catch (error) {
        return false;
    }
}
