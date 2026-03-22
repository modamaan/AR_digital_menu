/**
 * Triggers on-demand revalidation of specified paths
 * This allows instant cache updates without polling
 */
export async function triggerRevalidation(paths: string[]) {
    try {
        const revalidationSecret = process.env.REVALIDATION_SECRET;

        if (!revalidationSecret) {
            console.warn('REVALIDATION_SECRET not set, skipping revalidation');
            return { success: false, error: 'Secret not configured' };
        }

        // Get the base URL for the API call
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const response = await fetch(`${baseUrl}/api/revalidate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${revalidationSecret}`,
            },
            body: JSON.stringify({ paths }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Revalidation failed:', error);
            return { success: false, error: error.error };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('Error triggering revalidation:', error);
        return { success: false, error: 'Network error' };
    }
}
