/**
 * Compress an image file to under the target size
 * @param {File} file - The image file to compress
 * @param {number} maxSizeKB - Maximum size in KB (default: 30)
 * @returns {Promise<File>} - Compressed image file
 */
export async function compressImage(file, maxSizeKB = 30) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Start with quality 0.9 and reduce if needed
                let quality = 0.9;
                let attempts = 0;
                const maxAttempts = 10;

                const tryCompress = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate aspect ratio
                    const maxDimension = 800;
                    if (width > height && width > maxDimension) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else if (height > maxDimension) {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            const sizeKB = blob.size / 1024;

                            if (sizeKB <= maxSizeKB || attempts >= maxAttempts || quality <= 0.1) {
                                // Success or max attempts reached
                                const compressedFile = new File(
                                    [blob],
                                    file.name,
                                    { type: 'image/jpeg', lastModified: Date.now() }
                                );
                                resolve(compressedFile);
                            } else {
                                // Try again with lower quality
                                attempts++;
                                quality -= 0.1;
                                tryCompress();
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                };

                tryCompress();
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Convert File to base64 string
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
