import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/user';
import { currentUser } from '@clerk/nextjs/server';

/**
 * Ensures the current Clerk user exists in the database
 * Creates the user if they don't exist
 * @param clerkId - Optional Clerk user ID (required when called from middleware)
 * @returns The user's database ID
 */
export async function ensureUserExists(clerkId?: string) {
    const userId = clerkId || await getCurrentUserId();

    if (!userId) {
        throw new Error('Not authenticated');
    }

    // Check if user exists in database by clerk_id
    let existingUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
    });

    if (existingUser) {
        return existingUser.id;
    }

    // User doesn't exist by clerk_id, get their info from Clerk
    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            throw new Error('User info not found');
        }

        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

        // Check if user exists by email (might have different clerk_id from re-authentication)
        const existingUserByEmail = await db.query.users.findFirst({
            where: eq(users.email, email || ''),
        });

        if (existingUserByEmail) {
            // User exists with same email but different clerk_id - update the clerk_id
            const [updatedUser] = await db.update(users)
                .set({ clerkId: userId })
                .where(eq(users.id, existingUserByEmail.id))
                .returning();

            return updatedUser.id;
        }

        // Create new user
        const [newUser] = await db.insert(users).values({
            clerkId: userId,
            email: email || '',
            name,
        }).returning();

        return newUser.id;
    } catch (error) {
        console.error('[ensureUserExists] Error creating user:', error);
        throw new Error('Failed to create user');
    }
}
