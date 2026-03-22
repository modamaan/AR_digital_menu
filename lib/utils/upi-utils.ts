/**
 * UPI Utility Functions
 * Handles UPI deep link generation and validation
 */

/**
 * Validates UPI ID format
 * Format: username@bankname (e.g., merchant@paytm, user@oksbi)
 */
export function validateUpiId(upiId: string): boolean {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    return upiRegex.test(upiId);
}

/**
 * Generates a standard UPI payment link
 * @param upiId - Merchant's UPI ID
 * @param amount - Payment amount
 * @param name - Merchant name
 * @param note - Transaction note/description
 * @returns UPI intent URL
 */
export function generateUpiLink(
    upiId: string,
    amount: number,
    name: string,
    note: string
): string {
    const params = new URLSearchParams({
        pa: upiId, // Payee address
        pn: name, // Payee name
        am: amount.toFixed(2), // Amount
        cu: 'INR', // Currency
        tn: note, // Transaction note
    });

    return `upi://pay?${params.toString()}`;
}

/**
 * Generates PhonePe-specific deep link
 * @param upiId - Merchant's UPI ID
 * @param amount - Payment amount
 * @param name - Merchant name
 * @param note - Transaction note/description
 * @returns PhonePe deep link URL
 */
export function generatePhonePeLink(
    upiId: string,
    amount: number,
    name: string,
    note: string
): string {
    // PhonePe uses the standard UPI intent format
    return generateUpiLink(upiId, amount, name, note);
}

/**
 * Generates Google Pay-specific deep link
 * @param upiId - Merchant's UPI ID
 * @param amount - Payment amount
 * @param name - Merchant name
 * @param note - Transaction note/description
 * @returns Google Pay deep link URL
 */
export function generateGooglePayLink(
    upiId: string,
    amount: number,
    name: string,
    note: string
): string {
    const params = new URLSearchParams({
        pa: upiId,
        pn: name,
        am: amount.toFixed(2),
        cu: 'INR',
        tn: note,
    });

    // Google Pay specific URL format
    return `gpay://upi/pay?${params.toString()}`;
}

/**
 * Formats UPI ID for display (masks part of it)
 * @param upiId - UPI ID to format
 * @returns Masked UPI ID
 */
export function formatUpiId(upiId: string): string {
    const [username, domain] = upiId.split('@');
    if (!username || !domain) return upiId;

    if (username.length <= 4) {
        return upiId;
    }

    const visibleChars = 2;
    const masked = username.substring(0, visibleChars) + '***' + username.substring(username.length - visibleChars);
    return `${masked}@${domain}`;
}
