
let baseUrl = '';

/**
 * Initializes the module, saving the extension's base URL.
 * @param {string} url - The base URL obtained from the data-attribute.
 */
export function init(url) {
    if (!url.endsWith('/')) {
        url += '/';
    }
    baseUrl = url;
    console.log('Runtime initialized with base URL:', baseUrl);
}

/**
 * Creates a full URL to an extension resource.
 * @param {string} path - The relative path to the resource (e.g., 'styles/search-ui.css').
 * @returns {string} - The full, accessible URL.
 */
export function getURL(path) {
    if (!baseUrl) {
        throw new Error('Runtime not initialized. Call init() first.');
    }
    return baseUrl + path;
}