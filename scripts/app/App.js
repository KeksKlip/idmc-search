import { InformaticaAPI } from './InformaticaAPI.js';
import { UI } from './UI.js';
import { loadConfiguration } from './Config.js';
import { initializeJQueryExtensions, waitForElement, applyAndGuardHighlight } from './Utils.js';

class SearchApp {
    constructor() {
        try {
            this.workspace = InformaticaAPI.getWorkspace();
            this.portlet = InformaticaAPI.getCanvasPortlet(this.workspace);
        } catch (error) {
            console.error("Failed to get Informatica workspace context.", error);
            throw new Error("Could not initialize search tool. Informatica context not found.");
        }

        this.searchResultsData = [];
        this.imageCache = new Map();

        initializeJQueryExtensions();
        const apiConstants = InformaticaAPI.getConstants();
        const { CL, fieldIconMap, nodeTypeHandlers } = loadConfiguration(apiConstants);
        this.CL = CL;
        this.nodeTypeHandlers = nodeTypeHandlers;

        this.ui = new UI({
            onSearch: this.performSearch.bind(this),
            onResultClick: this.handleResultClick.bind(this),
            onClose: () => {
                document.querySelector('.tm-search-toolbar-btn')?.classList.remove('active');
            },
            fieldIconMap: fieldIconMap,
            CL: this.CL,
        });
    }

    async init() {
        await this.ui.init();
        this.preloadAllNodeIcons();
    }

    destroy() {
        console.log('Destroying SearchApp instance...');
        if (this.ui) {
            this.ui.destroy();
        }
    }

    toggleVisibility(buttonElement) {
        if (this.ui) {
            this.ui.toggleVisibility(buttonElement);
        }
    }

    async getImg(classId) {
        if (!classId) return null;
        if (this.imageCache.has(classId)) return this.imageCache.get(classId);

        const imgObj = await InformaticaAPI.getNodeImage(classId);
        this.imageCache.set(classId, imgObj);
        return imgObj;
    }

    preloadAllNodeIcons() {
        try {
            const allNodes = InformaticaAPI.getAllNodes(this.portlet);
            const uniqueClassIds = [...new Set(allNodes.map(node => node.object.$$class))];
            uniqueClassIds.forEach(id => this.getImg(id));
        } catch (error) {
            console.error("Icon preloading failed:", error);
        }
    }

    async performSearch() {
        const searchOptions = this.ui.getSearchOptions();

        if (searchOptions.query.length === 0 || (!searchOptions.searchInNodes && !searchOptions.searchInFields && !searchOptions.searchInExpressions)) {
            this.ui.renderResults([], 0);
            this.searchResultsData = [];
            return;
        }

        const allNodes = InformaticaAPI.getAllNodes(this.portlet);
        const filteredResults = [];
        let totalFound = 0;

        for (const node of allNodes) {
            const nodeObject = node.object;
            const nodeClassId = nodeObject.$$class;

            const resultNode = {
                name: nodeObject.name,
                node: node,
                nodeImg: this.imageCache.get(nodeClassId) || await this.getImg(nodeClassId),
                fields: [],
                isSearchResult: false,
            };

            if (searchOptions.searchInNodes && nodeObject.name.toLowerCase().includes(searchOptions.query)) {
                resultNode.isSearchResult = true;
                totalFound++;
            }

            const handler = this.nodeTypeHandlers[nodeClassId];
            if (handler && handler.search) {
                const foundFields = handler.search(nodeObject, searchOptions.query, searchOptions);
                if (foundFields.length > 0) {
                    resultNode.fields.push(...foundFields);
                    totalFound += foundFields.filter(f => f.isSearchResult || f.expression).length;
                }
            }

            if (resultNode.isSearchResult || resultNode.fields.length > 0) {
                filteredResults.push(resultNode);
            }
        }

        this.searchResultsData = filteredResults;
        this.ui.renderResults(filteredResults, totalFound);
    }

    async handleResultClick(e) {
        try {
            const propertiesContainer = InformaticaAPI.getPropertiesContainer(this.portlet);

            const clickableNode = e.target.closest(".tm-result-node-header.tm-is-clickable");
            const clickableField = e.target.closest(".tm-field-item, .tm-expression-item");

            if (!clickableNode && !clickableField) return;

            const target = clickableField || clickableNode;
            const nodeIndex = target.dataset.nodeIndex;
            const item = this.searchResultsData[nodeIndex];
            if (!item) return;

            console.debug(item);

            InformaticaAPI.selectNode(this.workspace, this.portlet, item.node);

            if (clickableField) {
                e.stopPropagation();
                const fieldIndex = clickableField.dataset.fieldIndex;
                const fieldObj = item.fields[fieldIndex];
                const nodeClass = item.node.object.$$class;

                const handler = this.nodeTypeHandlers[nodeClass];
                if (!handler) return;

                const clickConfig = handler.getClickConfig(fieldObj);
                if (!clickConfig) return;

                const tabLabel = await waitForElement(propertiesContainer, `.infa-tabLabel:textEquals(${clickConfig.tab})`);
                if (!tabLabel) {
                    console.error(`Tab with label "${clickConfig.tab}" not found.`);
                    return;
                }
                $(tabLabel).click();
                $(tabLabel).get(0).scrollIntoView({ behavior: "smooth", block: "center" });

                if (!clickConfig.selector) return;

                const panelId = $(tabLabel).closest("li").attr("aria-controls");
                if (!panelId) {
                    console.error(`Could not find aria-controls for tab: ${clickConfig.tab}`);
                    return;
                }

                const panelElement = await waitForElement(propertiesContainer, `#${panelId}:visible`);

                if (handler.preHighlightAction) {
                    panelElement.style.setProperty('overflow', 'auto', 'important');
                    await handler.preHighlightAction(fieldObj, panelElement, clickConfig, this.portlet);
                }

                await applyAndGuardHighlight({
                    container: panelElement,
                    selector: clickConfig.selector(fieldObj),
                    highlightClass: clickConfig.highlightClass || 'ui-state-highlight',
                    getTarget: (el) => el.parentElement,
                    scrollOptions: clickConfig.scrollOptions,
                    scrollContainerSelector: clickConfig.scrollContainerSelector
                });

                if (handler.postHighlightAction) {
                    await handler.postHighlightAction(fieldObj, panelElement, clickConfig);
                }
            }
        } catch (error) {
            console.error("An error occurred during click handling:", error);
        }
    }
}

export async function createSearchApp() {
    try {
        const app = new SearchApp();
        await app.init();
        return app;
    } catch (error) {
        console.error("Failed to create SearchApp:", error);
        return null;
    }
}