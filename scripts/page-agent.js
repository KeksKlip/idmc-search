import { createSearchApp } from './app/App.js';
import { init as initRuntime } from './app/Runtime.js';

const agentScript = document.getElementById('rwld-idmc-search-agent');
const baseUrl = agentScript.dataset.extensionBaseUrl;
initRuntime(baseUrl);

console.log('Page-Agent: Script loaded and executing.');

let currentAppInstance = null;
let currentMappingId = null;
let currentMappigInstance = null;
let observer = null;

function getMapping() {
    try {
        if (typeof infaw === 'undefined' || typeof infaw.template?.TemplateUIUtils?.instance !== 'function') {
            return {id: null, instance: null};
        }
        const workspace = infaw.template.TemplateUIUtils.instance().getWorkspace();
        if (!workspace || typeof workspace.getActiveInstanceId !== 'function') {
            return {id: null, instance: null};
        }
        return {id: workspace.getActiveInstanceId(), instance: workspace.getActiveInstance()};
    } catch (e) {
        console.log('Page-Agent: Error in getMappingId (this is often normal during page load):', e.message);
        return null;
    }
}

function injectSearchButton(toolbarActionsUl) {
    const searchButton = document.createElement('button');
    searchButton.className = 'infaButton infaButton-toolbar-icon tm-search-toolbar-btn';
    searchButton.title = 'Search in Mapping';
    searchButton.style.minWidth = '20px';
    searchButton.style.minHeight = '20px';
    searchButton.innerHTML = `
        <div class="infaButton-interior">
            <span class="infaButton-icon hasSVG" style="width: 20px; height: 20px;">
                <svg version="1.1" viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                    <path fill-rule="evenodd" d="M 9.5 0.5 a 9 9 0 0 1 9 9 c 0 2.02 -0.668 3.882 -1.791 5.383 l -0.203 0.261 l 2.695 2.643 a 0.999 0.999 0 0 1 -1.3 1.514 l -0.102 -0.088 l -2.715 -2.662 A 8.957 8.957 0 0 1 9.5 18.5 a 9 9 0 0 1 -9 -9 a 9 9 0 0 1 9 -9 m 0 2 c -3.859 0 -7 3.141 -7 7 s 3.141 7 7 7 s 7 -3.141 7 -7 s -3.141 -7 -7 -7 Z"/>
                </svg>
            </span>
        </div>
    `;

    const separatorLi = document.createElement('li');   
    separatorLi.className = 'tm-search-toolbar-item'; 
    separatorLi.innerHTML = '<div class="infa-template-canvas-toolbar-separator"></div>';   
    
    const buttonLi = document.createElement('li');
    buttonLi.className = 'tm-search-toolbar-item';
    const buttonSpanWrapper = document.createElement('span');
    buttonSpanWrapper.className = 'infa-template-canvas-toolbar-button';
    buttonSpanWrapper.appendChild(searchButton);
    buttonLi.appendChild(buttonSpanWrapper);

    toolbarActionsUl.appendChild(separatorLi);
    toolbarActionsUl.appendChild(buttonLi);
    
    console.log('Page-Agent: SUCCESS! Search button has been appended to the toolbar.');

    searchButton.addEventListener('click', async (event) => {
        const button = event.currentTarget;
        button.classList.toggle('active');
        
        if (!button.classList.contains('active')) {          
            if(currentAppInstance) {
                currentAppInstance.toggleVisibility(button);
            }
            return;
        }

        if (currentAppInstance) {
             currentAppInstance.toggleVisibility(button);
        } else {
            console.log('Page-Agent: Creating new SearchApp instance.');           
            currentAppInstance = await createSearchApp();
            if (currentAppInstance) {
                currentAppInstance.toggleVisibility(button);
            } else {
                button.classList.remove('active');
                alert("Failed to initialize the search tool.");
            }
        }
    });
}

function destroyCurrentApp() {
    if (currentAppInstance) {
        console.log('Page-Agent: Destroying current app instance.');
        currentAppInstance.destroy();
        currentAppInstance = null;
    }
    
    console.log('Page-Agent: Removing search button and separator from toolbar.');
    const oldButtonItems = document.querySelectorAll('.tm-search-toolbar-item');
    oldButtonItems.forEach(item => item.remove());
}

function mainLogic() {    
    let { id: newMappingId, instance: mapping } = getMapping();    

    if (!newMappingId) {
        if (currentMappingId) {
            console.log(`Page-Agent: Mapping context lost. Old ID: ${currentMappingId}. Destroying app.`);
            destroyCurrentApp();
            currentMappingId = null;
            currentMappigInstance = null;
        }
        return;
    }

    if (currentMappingId !== newMappingId) {
        console.log(`Page-Agent: Mapping changed. Old: ${currentMappingId}, New: ${newMappingId}. Re-initializing.`);
        destroyCurrentApp();
        currentMappingId = newMappingId;
        currentMappigInstance = mapping;
    }
   
    const toolbarActions = currentMappigInstance.$leftSplitter.get(0).querySelector('ul.infaPanel-actions');
    const alreadyInjected = currentMappigInstance.$leftSplitter.get(0).querySelector('.tm-search-toolbar-btn');

    if (toolbarActions && !alreadyInjected) {        
        injectSearchButton(toolbarActions);
    }
}

function startObserver() {
    if (observer) observer.disconnect();

    let timeout;
    observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(mainLogic, 500); 
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    console.log('Page-Agent: Observer started on document.body.'); 
}

startObserver();
