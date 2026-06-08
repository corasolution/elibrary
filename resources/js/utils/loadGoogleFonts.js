/**
 * Dynamically load Google Fonts
 * @param {string[]} fontNames - Array of font names to load
 */
export function loadGoogleFonts(fontNames) {
    if (!fontNames || fontNames.length === 0) return;

    // Check if fonts are already loaded
    const existingLink = document.getElementById('google-fonts-link');

    // Build Google Fonts URL
    const fontsQuery = fontNames
        .map(font => {
            const family = font.replace(/ /g, '+');
            return `family=${family}:wght@400;500;600;700`;
        })
        .join('&');

    const fontsUrl = `https://fonts.googleapis.com/css2?${fontsQuery}&display=swap`;

    if (existingLink) {
        // Update existing link
        existingLink.href = fontsUrl;
    } else {
        // Create new link element
        const link = document.createElement('link');
        link.id = 'google-fonts-link';
        link.rel = 'stylesheet';
        link.href = fontsUrl;
        document.head.appendChild(link);
    }
}
