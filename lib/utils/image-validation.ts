/**
 * Image Validation Utilities
 * Handles validation of uploaded payment screenshots
 */

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_WIDTH = 300;
const MIN_HEIGHT = 300;

export interface ImageValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validates image file type and size
 * @param file - File to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): ImageValidationResult {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Only PNG, JPG, JPEG, and WebP images are allowed.',
        };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
        };
    }

    return { valid: true };
}

/**
 * Validates image dimensions
 * @param file - Image file to validate
 * @returns Promise with validation result
 */
export async function validateImageDimensions(file: File): Promise<ImageValidationResult> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
                resolve({
                    valid: false,
                    error: `Image dimensions must be at least ${MIN_WIDTH}x${MIN_HEIGHT}px. Current: ${img.width}x${img.height}px`,
                });
            } else {
                resolve({ valid: true });
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({
                valid: false,
                error: 'Failed to load image. Please try a different file.',
            });
        };

        img.src = url;
    });
}

/**
 * Extracts metadata from image file
 * @param file - Image file
 * @returns Metadata object
 */
export function getImageMetadata(file: File) {
    return {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        lastModifiedDate: new Date(file.lastModified).toISOString(),
    };
}

/**
 * Validates complete image upload
 * @param file - Image file to validate
 * @returns Promise with validation result
 */
export async function validatePaymentScreenshot(file: File): Promise<ImageValidationResult> {
    // First validate file type and size
    const fileValidation = validateImageFile(file);
    if (!fileValidation.valid) {
        return fileValidation;
    }

    // Then validate dimensions
    const dimensionValidation = await validateImageDimensions(file);
    if (!dimensionValidation.valid) {
        return dimensionValidation;
    }

    return { valid: true };
}
