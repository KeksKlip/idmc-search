console.log('Content script loaded. Injecting page-agent...');
function injectAgent() {
    const id = 'rwld-idmc-search-agent';
    if (document.getElementById(id)) {
        return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = chrome.runtime.getURL('scripts/page-agent.js');
    script.dataset.extensionBaseUrl = chrome.runtime.getURL('');    
    (document.head || document.documentElement).appendChild(script);
}
injectAgent();