export function initializeJQueryExtensions() {
    if (typeof $.expr.pseudos.textEquals === 'undefined') {
        $.expr.pseudos.textEquals = $.expr.createPseudo(function (arg) {
            return function (elem) {
                return $(elem).text().trim() === arg;
            };
        });
    }
}

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitForElement(rootElement, selector, options = {}) {
    if (typeof jQuery === "undefined") {
        return Promise.reject(new Error("waitForElement: jQuery is not defined."));
    }
    return new Promise((resolve, reject) => {
        const { timeout = 10000, checkVisibility = false } = options;
        let observer, timeoutId;
        const isElementVisible = (el) => {
            if (!el) return false;
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
                rect.width > 0 &&
                rect.height > 0
            );
        };
        const cleanup = () => {
            if (observer) observer.disconnect();
            clearTimeout(timeoutId);
        };
        const checkCondition = () => {
            const $elements = $(rootElement).find(selector);
            if ($elements.length === 0) return;
            const element = $elements.get(0);
            if (checkVisibility && !isElementVisible(element)) return;
            cleanup();
            resolve(element);
        };
        observer = new MutationObserver(checkCondition);
        timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error(`waitForElement: Timed out after ${timeout}ms for selector "${selector}"`));
        }, timeout);
        observer.observe(rootElement, { childList: true, subtree: true, attributes: true });
        checkCondition();
    });
}

export async function applyAndGuardHighlight({ container, selector, highlightClass, getTarget = el => el, guardTimeout = 5000, scrollOptions, scrollContainerSelector }) {
    let foundElement = await waitForElement(container, selector);
    if (!foundElement) {
        console.warn(`applyAndGuardHighlight: Initial element not found for selector "${selector}"`);
        return;
    }

    const applyHighlight = (element) => {
        $(container).find(`.${highlightClass}`).removeClass(highlightClass);
        const targetToHighlight = getTarget(element);
        if (targetToHighlight) {
            $(targetToHighlight).addClass(highlightClass);

            if (scrollContainerSelector) {
                const $scrollContainer = $(targetToHighlight).closest(scrollContainerSelector);
                if ($scrollContainer.length > 0) {
                    const containerHeight = $scrollContainer.height();
                    const elementTopRelativeToContainer = $(targetToHighlight).position().top;
                    const currentScrollTop = $scrollContainer.scrollTop();
                    const newScrollTop = currentScrollTop + elementTopRelativeToContainer - (containerHeight / 2) + ($(targetToHighlight).outerHeight() / 2);

                    $scrollContainer.animate({ scrollTop: newScrollTop }, 300);
                } else {
                    targetToHighlight.scrollIntoView(scrollOptions || { behavior: "smooth", block: "center" });
                }
            } else {
                targetToHighlight.scrollIntoView(scrollOptions || { behavior: "smooth", block: "center" });
            }
        }
    };

    applyHighlight(foundElement);

    const observer = new MutationObserver(() => {
        if (!document.body.contains(foundElement)) {
            const newFoundElement = $(container).find(selector).get(0);
            if (newFoundElement) {
                foundElement = newFoundElement;
                applyHighlight(foundElement);
            }
        }
    });

    observer.observe(container, { childList: true, subtree: true });

    setTimeout(() => observer.disconnect(), guardTimeout);
}