/**
 * Extracts values from an object by path. Supports '*' as a wildcard for arrays.
 * Always returns an array, even if only one item is found.
 * @param {object} obj - The source object.
 * @param {string} path - The path, e.g., 'inputGroups.*.fields' or 'rankField'.
 * @returns {Array} - A flat array of all found values.
 */
export function getValuesByPath(obj, path) {
    const segments = path.split('.');

    function find(currentObject, currentSegments) {
        if (currentSegments.length === 0) {
            if (currentObject === null || currentObject === undefined) return [];
            return Array.isArray(currentObject) ? currentObject : [currentObject];
        }

        const key = currentSegments[0];
        const restOfSegments = currentSegments.slice(1);

        if (currentObject === null || currentObject === undefined) {
            return [];
        }

        if (key === '*') {
            if (!Array.isArray(currentObject)) {
                console.warn(`Path wildcard '*' used on a non-array value for path: ${path}`);
                return [];
            }
            return currentObject.flatMap(item => find(item, restOfSegments));
        } else {
            const nextObject = currentObject[key];
            return find(nextObject, restOfSegments);
        }
    }
    return find(obj, segments);
}

/**
 * A factory for creating universal search functions.
 * @param {Array<string|{path: string, props: object, fieldNameKey: string}>} searchConfigs
 * @returns {function(object, string, object): Array}
 */
export function createSearchFunction(searchConfigs) {
    return function (nodeObj, query, options) {
        const results = [];
        const processedFields = new Set();

        for (const config of searchConfigs) {
            const path = typeof config === 'string' ? config : config.path;
            const extraProps = typeof config === 'object' ? config.props : {};
            const fieldNameKey = typeof config === 'object' ? config.fieldNameKey || 'name' : 'name';
            const compose = typeof config === 'object' ? config.compose : null;
            const isExpressionSearch = typeof config === 'object' ? config.isExpression : false;

            const fields = getValuesByPath(nodeObj, path);

            for (const rawField of fields) {
                if (processedFields.has(rawField)) continue;

                let fieldObject, fieldName, composedString;

                if (compose) {
                    fieldObject = rawField;
                    composedString = compose(rawField);
                    fieldName = composedString;
                } else if (typeof rawField === 'string') {
                    fieldObject = { name: rawField };
                    fieldName = rawField;
                } else if (typeof rawField === 'object' && rawField !== null) {
                    fieldObject = rawField;
                    fieldName = rawField[fieldNameKey];
                } else {
                    continue;
                }

                let foundFieldData = null;
                const searchString = composedString || fieldName;

                if (options.searchInFields && searchString?.toLowerCase().includes(query)) {
                    foundFieldData = { field: { ...fieldObject, name: fieldName }, isSearchResult: true };
                }

                if (options.searchInExpressions && fieldObject.expression) {
                    if (fieldObject.expression?.toLowerCase().includes(query)) {
                        if (!foundFieldData) {
                            foundFieldData = { field: { ...fieldObject, name: fieldName }, isSearchResult: false };
                        }
                        foundFieldData.expression = fieldObject.expression;
                    }
                }

                if (foundFieldData) {
                    const finalResult = { ...foundFieldData, ...extraProps };
                    results.push(finalResult);
                    processedFields.add(rawField);
                }
            }
        }
        return results;
    };
}