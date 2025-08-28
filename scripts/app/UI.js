import { getURL as getExtensionURL } from './Runtime.js';

function loadStylesheet(id, href) {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = href;
        link.onload = () => resolve();
        link.onerror = (err) => {
            console.error(`Failed to load stylesheet: ${href}`, err);
            reject(err);
        };
        document.head.appendChild(link);
    });
}

export class UI {
    constructor({ onSearch, onResultClick, onClose, fieldIconMap, CL }) {
        this.onSearch = onSearch;
        this.onResultClick = onResultClick;
        this.onClose = onClose;
        this.fieldIconMap = fieldIconMap;
        this.CL = CL;

        this.panel = null;
        this.header = null;
        this.input = null;
        this.searchBtn = null;
        this.resultsContainer = null;
        this.closeBtn = null;

        this.isManuallyPositioned = false;
    }


    async init() {
        try {
            await this.injectStyles();
            this.createPanel();
            this.attachEventListeners();
            this.hide();
        } catch (error) {
            console.error("UI Initialization failed:", error);
        }
    }


    show(buttonElement) {
        if (!this.panel) return;

        this.panel.style.visibility = 'hidden';
        this.panel.style.display = 'flex';

        if (buttonElement && !this.isManuallyPositioned) {
            const buttonRect = buttonElement.getBoundingClientRect();
            const panelWidth = this.panel.offsetWidth;

            const top = buttonRect.bottom + 10;
            const left = buttonRect.right - panelWidth;

            this.panel.style.top = `${top}px`;
            this.panel.style.left = `${left}px`;
            this.panel.style.right = 'auto';
        }

        this.panel.style.visibility = 'visible';
        this.input.focus();
    }


    hide() {
        if (!this.panel) return;
        this.panel.style.display = 'none';
        this.onClose();
    }

    toggleVisibility(buttonElement) {
        if (!this.panel) return;
        const isVisible = this.panel.style.display === 'flex';
        if (isVisible) {
            this.hide();
        } else {
            this.show(buttonElement);
        }
    }

    destroy() {
        const panelElement = document.getElementById("tm-search-panel");
        if (panelElement) {
            panelElement.remove();
        }

        const customStyles = document.getElementById("tm-search-panel-styles");
        if (customStyles) {
            customStyles.remove();
        }

        const flaticonStyles = document.getElementById("tm-flaticon-uicons-style");
        if (flaticonStyles) {
            flaticonStyles.remove();
        }

        this.onClose();
    }

    getSearchOptions() {
        return {
            searchInNodes: document.getElementById("tm-search-nodes").checked,
            searchInFields: document.getElementById("tm-search-fields").checked,
            searchInExpressions: document.getElementById("tm-search-expressions").checked,
            query: this.input.value.trim().toLowerCase(),
        };
    }

    injectStyles() {
        const stylePromises = [
            loadStylesheet(
                "tm-search-panel-styles",
                getExtensionURL('assets/css/search-ui.css')
            ),
            loadStylesheet(
                "tm-flaticon-uicons-style",
                getExtensionURL("assets/css/uicons-solid-rounded.css")
            )
        ];
        return Promise.all(stylePromises);
    }


    createPanel() {
        const html = `
            <div id="tm-search-panel">
                <div id="tm-search-header">
                    <span id="tm-search-header-title">Search in Mapping</span>
                    <span id="tm-search-close">✖</span>
                </div>
                <div id="tm-search-options">
                    <label><input type="checkbox" id="tm-search-nodes" checked> in Names</label>
                    <label><input type="checkbox" id="tm-search-fields" checked> in Fields</label>
                    <label><input type="checkbox" id="tm-search-expressions" checked> in Expressions</label>
                </div>
                <input id="tm-search-input" type="text" placeholder="Enter search term...">
                <button id="tm-search-button">Search</button>
                <div id="tm-search-count"></div>
                <div id="tm-search-results"></div>
            </div>
        `;
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        document.body.appendChild(wrapper.firstElementChild);


        this.panel = document.getElementById("tm-search-panel");

        this.panel.style.width = '315px';

        this.header = document.getElementById("tm-search-header");
        this.input = document.getElementById("tm-search-input");
        this.searchBtn = document.getElementById("tm-search-button");
        this.resultsContainer = document.getElementById("tm-search-results");
        this.closeBtn = document.getElementById("tm-search-close");
    }

    attachEventListeners() {
        this.closeBtn.addEventListener("click", () => this.hide());
        this.searchBtn.addEventListener("click", () => this.onSearch());
        this.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.onSearch();
        });
        this.resultsContainer.addEventListener("click", (e) => this.onResultClick(e));

        let offsetX = 0, offsetY = 0, isDragging = false;
        this.header.addEventListener("mousedown", (e) => {
            this.isManuallyPositioned = true;
            isDragging = true;
            offsetX = e.clientX - this.panel.getBoundingClientRect().left;
            offsetY = e.clientY - this.panel.getBoundingClientRect().top;
            e.preventDefault();
        });
        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            this.panel.style.left = `${e.clientX - offsetX}px`;
            this.panel.style.top = `${e.clientY - offsetY}px`;
            this.panel.style.right = "auto";
        });
        document.addEventListener("mouseup", () => { isDragging = false; });
    }

    renderResults(searchResultsData, totalFound) {
        this.resultsContainer.style.display = "block";
        const countEl = document.getElementById("tm-search-count");

        if (totalFound === 0) {
            this.panel.style.height = "auto";
            this.resultsContainer.textContent = "No results found.";
            countEl.textContent = "";
            return;
        }

        this.panel.style.height = "500px";
        countEl.textContent = `${totalFound} found`;

        const resultsHtml = searchResultsData.map((item, nodeIndex) => {
            const fieldsHtml = (item.fields || []).map((fieldObj, fieldIndex) => {
                const htmlParts = [];
                const iconData = this.fieldIconMap[fieldObj?.icon] || this.fieldIconMap[fieldObj?.$$class] || this.fieldIconMap[fieldObj?.field?.$$class] || this.fieldIconMap[this.CL.TX_FIELD];
                const iconHtml = iconData ? iconData.icon : `<i class="fi fi-sr-pen-field"></i>`;

                if (fieldObj.isSearchResult) {
                    htmlParts.push(`
                        <div class="tm-field-item" data-node-index="${nodeIndex}" data-field-index="${fieldIndex}">
                            ${iconHtml}
                            <span class="tm-ellipsis" title="${CSS.escape(String(fieldObj.field.name))}">${fieldObj.field.name}</span>
                        </div>
                    `);
                }

                if (fieldObj.expression) {
                    if (!fieldObj.isSearchResult) {
                        htmlParts.push(`
                            <div class="tm-field-header">
                                ${iconHtml}
                                <span class="tm-ellipsis" title="${CSS.escape(String(fieldObj.field.name))}">${fieldObj.field.name}</span>
                            </div>
                        `);
                    }
                    htmlParts.push(`
                        <div class="tm-expression-item" data-node-index="${nodeIndex}" data-field-index="${fieldIndex}">
                            <i class="fi fi-sr-square-code" title="Expression"></i>
                            <span class="tm-ellipsis" title="${CSS.escape(String(fieldObj.expression))}">${fieldObj.expression}</span>
                        </div>
                    `);
                }
                return htmlParts.join("");
            }).join("");

            const imgSrc = item.nodeImg ? item.nodeImg.src : '';

            return `
                <div class="tm-result-item">
                    <div class="tm-result-node-header ${item.isSearchResult ? "tm-is-clickable" : ""}" data-node-index="${nodeIndex}">
                        <img src="${imgSrc}" alt="">
                        <span class="tm-ellipsis" title="${CSS.escape(String(item.name))}">${item.name}</span>
                    </div>
                    ${fieldsHtml ? `<div class="tm-result-fields-list">${fieldsHtml}</div>` : ""}
                </div>
            `;
        }).join("");

        this.resultsContainer.innerHTML = resultsHtml;
    }
}