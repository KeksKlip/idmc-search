document.addEventListener('DOMContentLoaded', () => {
    const manifestData = chrome.runtime.getManifest();
    const version = manifestData.version;
    const versionPlaceholder = document.getElementById('version-placeholder');
    if (versionPlaceholder) {
        versionPlaceholder.textContent = version;
    }
    const links = document.querySelectorAll('a[target="_blank"]');
    links.forEach(link => {
        link.rel = 'noopener noreferrer';
    });
});