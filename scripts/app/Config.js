import { createSearchFunction, getValuesByPath } from './Search.js';
import { waitForElement } from './Utils.js';
import { InformaticaAPI } from './InformaticaAPI.js';

export function loadConfiguration(nameMap) {
    const CL = {
        ACCESS_POLICY: nameMap['com.informatica.metadata.template.tx.tmpldam.accesspolicy.TmplAccessPolicy'].id,
        AGGREGATOR: nameMap['com.informatica.metadata.template.tx.tmplaggregator.TmplAggregator'].id,
        B2B: nameMap['com.informatica.metadata.template.tx.tmplb2b.TmplB2b'].id,
        CLEANSE: nameMap['com.informatica.metadata.template.tx.tmplcleanse.TmplCleanse'].id,
        DATA_MASKING: nameMap['com.informatica.metadata.template.tx.tmpldmo.TmplDmo'].id,
        DATA_SERVICES: nameMap['com.informatica.metadata.template.tx.tmpldataServices.TmplDataServices'].id,
        DEDUPLICATE: nameMap['com.informatica.metadata.template.tx.tmpldedup.TmplDedup'].id,
        EXPRESSION: nameMap['com.informatica.metadata.template.tx.tmplexpression.TmplExpression'].id,
        FILTER: nameMap['com.informatica.metadata.template.tx.tmplfilter.TmplFilter'].id,
        HIERARCHY_BUILDER: nameMap['com.informatica.metadata.template.tx.tmplr2h.TmplR2h'].id,
        HIERARCHY_PARSER: nameMap['com.informatica.metadata.template.tx.tmplx2r.TmplX2r'].id,
        HIERARCHY_PROCESSOR: nameMap['com.informatica.metadata.template.tx.tmplhprocessor.TmplHprocessor'].id,
        INPUT: nameMap['com.informatica.metadata.template.tx.tmplinput.TmplInput'].id,
        JAVA: nameMap['com.informatica.metadata.template.tx.tmpljava.TmplJava'].id,
        JOINER: nameMap['com.informatica.metadata.template.tx.tmpljoiner.TmplJoiner'].id,
        LABELER: nameMap['com.informatica.metadata.template.tx.tmpllabeler.TmplLabeler'].id,
        LOOKUP: nameMap['com.informatica.metadata.template.tx.tmpllookup.TmplLookup'].id,
        MACHINE_LEARNING: nameMap['com.informatica.metadata.template.tx.tmplml.TmplML'].id,
        MAPPLET: nameMap['com.informatica.metadata.template.tx.tmplmapplet.TmplMapplet'].id,
        NORMALIZER: nameMap['com.informatica.metadata.template.tx.tmplnormalizer.TmplNormalizer'].id,
        OUTPUT: nameMap['com.informatica.metadata.template.tx.tmploutput.TmplOutput'].id,
        PARSE: nameMap['com.informatica.metadata.template.tx.tmplparse.TmplParse'].id,
        PYTHON: nameMap['com.informatica.metadata.template.tx.tmplpython.TmplPython'].id,
        RANK: nameMap['com.informatica.metadata.template.tx.tmplrank.TmplRank'].id,
        ROUTER: nameMap['com.informatica.metadata.template.tx.tmplrouter.TmplRouter'].id,
        RULE_SPECIFICATION: nameMap['com.informatica.metadata.template.tx.tmplrulespec.TmplRuleSpecification'].id,
        SEQUENCE: nameMap['com.informatica.metadata.template.tx.tmplgenerator.TmplGenerator'].id,
        SORTER: nameMap['com.informatica.metadata.template.tx.tmplsorter.TmplSorter'].id,
        SOURCE: nameMap['com.informatica.metadata.template.tx.tmplsource.TmplSource'].id,
        SQL: nameMap['com.informatica.metadata.template.tx.tmplsql.TmplSql'].id,
        STRUCTURE_PARSER: nameMap['com.informatica.metadata.template.tx.tmplstructurediscovery.TmplStructureDiscovery'].id,
        TARGET: nameMap['com.informatica.metadata.template.tx.tmpltarget.TmplTarget'].id,
        TRANSACTION_CONTROL: nameMap['com.informatica.metadata.template.tx.tmpltransaction.TmplTransaction'].id,
        UNION: nameMap['com.informatica.metadata.template.tx.tmplunion.TmplUnion'].id,
        VELOCITY: nameMap['com.informatica.metadata.template.tx.tmplvelocity.TmplVelocity'].id,
        VERIFIER: nameMap['com.informatica.metadata.template.tx.tmplverifier.TmplVerifier'].id,
        WEB_SERVICES: nameMap['com.informatica.metadata.template.tx.tmplhierarchy.TmplHierarchy'].id,
        TX_FIELD: nameMap['com.informatica.metadata.template.common.field.TxField'].id,
        TX_FIELD_MAPPING: nameMap['com.informatica.metadata.template.common.field.TxFieldMapping'].id,
        EXPRESSION_FIELD: nameMap['com.informatica.metadata.template.tx.tmplexpression.TmplExpressionField'].id,
        LOOKUP_CONDITION: nameMap['com.informatica.metadata.template.tx.tmpllookup.LookupCondition'].id,
        NORMALIZER_FIELD: nameMap['com.informatica.metadata.template.tx.tmplnormalizer.NormalizerField'].id,
        AGGREGATOR_FIELD: nameMap['com.informatica.metadata.template.tx.tmplaggregator.TmplAggregatorField'].id,
        AGGREGATOR_GROUP_BY_FIELD: nameMap['com.informatica.metadata.template.tx.tmplaggregator.TmplAggregatorGroupByField'].id,
        FILTER_CONDITION: nameMap['com.informatica.metadata.template.tx.tmplfilter.FilterCondition'].id,
        JAVA_GROUPBY_FIELD: nameMap['com.informatica.metadata.template.tx.tmpljava.TmplJavaGroupByField'].id,
        SORT_ENTRY_JAVA: nameMap['com.informatica.metadata.template.tx.tmpljava.SortEntryJava'].id,
        PYTHON_PARTITION_KEY: nameMap['com.informatica.metadata.template.tx.tmplpython.TmplPythonPartitionKey'].id,
        PYTHON_RESOURCE_FILE: nameMap['com.informatica.metadata.template.tx.tmplpython.TmplPythonResourceFile'].id,
        RANK_BY_FIELD: "rankBy"
    };

    const fieldIconMap = {
        'CODE': { icon: `<i class="fi fi-sr-square-code"></i>` },
        'JOIN': { icon: `<i class="fi fi-sr-insert-arrows"></i>` },
        'FILTER': { icon: `<i class="fi fi-sr-filter" ></i>` },
        'FILTER_ADV': { icon: `<i class="fi fi-sr-filter-list" ></i>` },
        [CL.EXPRESSION_FIELD]: { icon: `<i class="fi fi-sr-api"></i>` },
        [CL.LOOKUP_CONDITION]: { icon: `<i class="fi fi-sr-password-magnifying-glass"></i>` },
        [CL.NORMALIZER_FIELD]: { icon: `<i class="fi fi-sr-diagram-predecessor"></i>` },
        [CL.TX_FIELD]: { icon: `<i class="fi fi-sr-pen-field"></i>` },
        [CL.AGGREGATOR_GROUP_BY_FIELD]: { icon: `<i class="fi fi-sr-share"></i>` },
        [CL.RANK_BY_FIELD]: { icon: `<i class="fi fi-sr-ranking-podium"></i>` },
    };

    const defaultHandlerConfig = {
        search: createSearchFunction(['fields']),
        getClickConfig: (fieldObj) => ({
            tab: "Fields",
            selector: (f) => `.ui-jqgrid tr td[title="${CSS.escape(f.field.name)}"]`,
            highlightClass: 'tm-search-highlight-field'
        })
    };

    function createHandler(overrides = {}) {
        const config = { ...defaultHandlerConfig, ...overrides };
        if (overrides.getClickConfig) {
            config.getClickConfig = (fieldObj) => {
                const defaultClickConfig = defaultHandlerConfig.getClickConfig(fieldObj) || {};
                const overrideClickConfig = overrides.getClickConfig(fieldObj) || {};
                return { ...defaultClickConfig, ...overrideClickConfig };
            };
        }
        return config;
    }

    const nodeTypeHandlers = {
        // --- Base Handlers ---
        [CL.INPUT]: createHandler({ getClickConfig: () => ({ tab: "Input Fields" }) }),
        [CL.SOURCE]: createHandler(),
        [CL.TARGET]: createHandler({ getClickConfig: () => ({ tab: "Target Fields" }) }),
        [CL.UNION]: createHandler({ getClickConfig: () => ({ tab: "Output Fields" }) }),
        [CL.OUTPUT]: createHandler({ getClickConfig: () => ({ tab: "Output Fields" }) }),
        [CL.EXPRESSION]: createHandler({ getClickConfig: () => ({ tab: "Expression" }) }),
        [CL.SORTER]: createHandler({
            search: createSearchFunction([{ path: 'sortEntries', fieldNameKey: 'fieldName' }]),
            getClickConfig: () => ({ tab: "Sort" })
        }),
        [CL.ROUTER]: createHandler({
            search: createSearchFunction([{
                path: 'groupFilterConditions',
                fieldNameKey: 'advancedFilterCondition',
                isExpression: true
            }]),
            getClickConfig: () => ({ tab: "Output Groups" })
        }),

        // ---  Declaratively Configured Handlers ---
        [CL.NORMALIZER]: createHandler({
            search: createSearchFunction(['normalizerFields.fieldList']),
            getClickConfig: () => ({ tab: "Normalized Fields", selector: (f) => `.ui-jqgrid tr td[title~="${CSS.escape(f.field.name)}"]` })
        }),
        [CL.CLEANSE]: createHandler({
            search: createSearchFunction([
                { path: 'inputFields.fieldList', props: { direction: 'in' } },
                { path: 'outputFields.fieldList', props: { direction: 'out' } }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.direction === "in") {
                    return { tab: "Cleanse", selector: (f) => `.ui-jqgrid tr td[title~="${CSS.escape(f.field.name)}"]` };
                }
                return { tab: "Output Fields", selector: (f) => `.ui-jqgrid tr td[title="${CSS.escape(f.field.name)}"]` };
            }
        }),
        [CL.MAPPLET]: createHandler({
            search: createSearchFunction([
                { path: 'inputGroups.*.fields', props: { direction: 'in' } },
                { path: 'outputGroups.*.fields', props: { direction: 'out' } }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.direction === "in") {
                    return { tab: "Field Mapping", selector: (f) => `.fieldMapping-right-pane .ui-jqgrid tr td:textEquals("${f.field.name}")` };
                }
                return { tab: "Output Fields", selector: (f) => `.ui-jqgrid tr td[title="${CSS.escape(f.field.name)}"]` };
            }
        }),
        [CL.VERIFIER]: createHandler({
            search: createSearchFunction([
                { path: 'inputGroups.*.fieldMapping.fields', props: { direction: 'in', $$class: CL.TX_FIELD_MAPPING } },
                { path: 'outputFields.fieldList', props: { direction: 'out', $$class: CL.TX_FIELD } }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.direction === "in") {
                    return { tab: "Field Mapping", selector: (f) => `.fieldMapping-right-pane .ui-jqgrid tr td:textEquals("${f.field.name}")` };
                }
                return { tab: "Output Fields", selector: (f) => `.ui-jqgrid tr td[title~="${CSS.escape(f.field.name)}"]` };
            }
        }),
        [CL.B2B]: createHandler({
            search: createSearchFunction([
                { path: 'fieldMapping.fields', props: { direction: 'in' } },
                'fields'
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.direction === "in") {
                    return { tab: "Field Mapping", selector: (f) => `.fieldMapping-right-pane .ui-jqgrid tr td:textEquals("${f.field.name}")` };
                }
                return { tab: "Output Fields" };
            }
        }),
        [CL.RANK]: createHandler({
            search: createSearchFunction([
                { path: 'rankField', props: { $$class: CL.RANK_BY_FIELD } },
                { path: 'groupByFieldsList.fields', fieldNameKey: 'fieldName' }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.$$class === CL.RANK_BY_FIELD) {
                    return { tab: "Rank", selector: null };
                }
                return { tab: "Group By", selector: (f) => `.ui-jqgrid tr td[title="${CSS.escape(f.field.name)}"]` };
            }
        }),
        [CL.DATA_MASKING]: createHandler({
            search: createSearchFunction([{ path: 'maskingEntries', fieldNameKey: 'referenceField' }]),
            getClickConfig: () => ({ tab: "Masking Rules" })
        }),
        [CL.DEDUPLICATE]: createHandler({
            search: createSearchFunction([
                { path: 'inputGroups.*.fieldMapping.fields' },
                { path: 'outputFields.fieldList' }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.field.$$class === CL.TX_FIELD_MAPPING) {
                    return { tab: "Field Mapping", selector: (f) => `.fieldMapping-right-pane .ui-jqgrid tr td:textEquals("${f.field.name}")` };
                }
                return { tab: "Output Fields" };
            }
        }),
        [CL.JAVA]: createHandler({
            search: createSearchFunction([
                { path: 'outputFields' },
                { path: 'groupByFieldsList.fields' },
                { path: 'sortEntriesJava', fieldNameKey: 'fieldName' },
                { path: 'onInputRowMethodSnippet', props: { tab: 'java', codeTab: 'On Input Row' }, isExpression: true }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.field.$$class === CL.JAVA_GROUPBY_FIELD) {
                    return { tab: "Group By" };
                }
                if (fieldObj.field.$$class === CL.SORT_ENTRY_JAVA) {
                    return { tab: "Sort" };
                }
                if (fieldObj.tab === 'java') {
                    return { tab: "Java", selector: null };
                }
                return { tab: "Output Fields" };
            }
        }),
        [CL.PYTHON]: createHandler({
            search: createSearchFunction([
                { path: 'outputFields' },
                { path: 'partitionKeys.fields', fieldNameKey: 'fieldName' },
                { path: 'resourceFiles.resourceFiles', fieldNameKey: 'fileName' },
                { path: 'pythonCode', props: { tab: 'python', codeTab: 'Main Python Code' }, isExpression: true },
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.field.$$class === CL.PYTHON_PARTITION_KEY) {
                    return { tab: "Partition Keys" };
                }
                if (fieldObj.field.$$class === CL.PYTHON_RESOURCE_FILE) {
                    return { tab: "Resource Files" };
                }
                if (fieldObj.tab === 'python') {
                    return { tab: "Python", selector: null };
                }
                return { tab: "Output Fields" };
            }
        }),
        [CL.LABELER]: createHandler({
            search: createSearchFunction([
                { path: 'inputFields.fieldList', props: { direction: 'in' } },
                { path: 'inputGroups.*.fieldMapping.fields', props: { direction: 'in' } },
                { path: 'outputFields.fieldList', props: { direction: 'out' } }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.direction === "in") {
                    return { tab: "Field Mapping", selector: (f) => `.fieldMapping-right-pane .ui-jqgrid tr td:textEquals("${f.field.name}")` };
                }
                return { tab: "Output Fields" };
            }
        }),
        [CL.PARSE]: createHandler({
            search: createSearchFunction([
                { path: 'inputFields.fieldList', props: { direction: 'in' } },
                { path: 'inputGroups.*.fieldMapping.fields', props: { direction: 'in' } },
                { path: 'outputFields.fieldList', props: { direction: 'out' } }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.direction === "in") {
                    return { tab: "Field Mapping", selector: (f) => `.fieldMapping-right-pane .ui-jqgrid tr td:textEquals("${f.field.name}")` };
                }
                return { tab: "Output Fields" };
            }
        }),
        [CL.RULE_SPECIFICATION]: createHandler({
            search: createSearchFunction([
                { path: 'inputFields.fieldList', props: { direction: 'in' } },
                { path: 'inputGroups.*.fieldMapping.fields', props: { direction: 'in' } },
                { path: 'outputFields.fieldList', props: { direction: 'out' } }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.direction === "in") {
                    return { tab: "Field Mapping", selector: (f) => `.fieldMapping-right-pane .ui-jqgrid tr td:textEquals("${f.field.name}")` };
                }
                return { tab: "Output Fields" };
            }
        }),
        [CL.TRANSACTION_CONTROL]: createHandler({
            search: createSearchFunction([{ path: 'condition', isExpression: true }]),
            getClickConfig: () => ({ tab: "Transaction Control", selector: null })
        }),
        [CL.VELOCITY]: createHandler({
            search: createSearchFunction([
                { path: 'velocityTemplate', props: { icon: CL.EXPRESSION_ICON, tab: 'velocityTemplate' }, isExpression: true },
                { path: 'inputFormats.*.field', props: { tab: 'inputFormat' } },
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.tab === "inputFormat") {
                    return { tab: "Input Format", selector: (f) => `.infaFormSection div[data-label-value="Input Field"]` };
                }
                return { tab: "Velocity Template", selector: null };
            }
        }),
        [CL.FILTER]: createHandler({
            search: createSearchFunction([
                {
                    path: 'filterConditions',
                    compose: c => `${c.fieldName} ${c.operator} ${c.filterValue}`,
                    props: { icon: 'FILTER' },
                },
                {
                    path: 'advancedFilterCondition',
                    props: { icon: 'FILTER_ADV' },
                }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.field.$$class === CL.FILTER_CONDITION) {
                    return { tab: "Filter", selector: (f) => `.ui-jqgrid tr td[title~="${CSS.escape(f.field.fieldName)}"]` };
                }
                return { tab: "Filter", selector: null };
            }
        }),
        [CL.JOINER]: createHandler({
            search: createSearchFunction([{
                path: 'joinConditions',
                compose: c => `${c.leftOperand} ${c.operator} ${c.rightOperand}`,
                props: { icon: 'JOIN' },
            }]),
            getClickConfig: () => ({ tab: "Join Condition", selector: (f) => `.ui-jqgrid tr td[title="${CSS.escape(f.field.leftOperand)}"]` })
        }),
        [CL.AGGREGATOR]: createHandler({
            search: createSearchFunction([
                { path: 'groupByFieldsList.fields', fieldNameKey: 'fieldName', props: { $$class: CL.AGGREGATOR_GROUP_BY_FIELD } },
                { path: 'fields', props: { $$class: CL.AGGREGATOR_FIELD } }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.field.$$class === CL.AGGREGATOR_GROUP_BY_FIELD) {
                    return { tab: "Group By", selector: (f) => `.ui-jqgrid tr td[title~="${CSS.escape(f.field.name)}"]` };
                }
                return { tab: "Aggregate", selector: (f) => `.ui-jqgrid tr td[title~="${CSS.escape(f.field.name)}"]` };
            }
        }),
        [CL.LOOKUP]: createHandler({
            search: createSearchFunction([
                { path: 'fields', props: { $$class: CL.TX_FIELD } },
                {
                    path: 'lookupConditions',
                    compose: c => `${c.leftOperand} ${c.operator} ${c.rightOperand}`,
                    props: { $$class: CL.LOOKUP_CONDITION },
                    isExpression: true
                }
            ]),
            getClickConfig: (fieldObj) => {
                if (fieldObj.field.$$class === CL.LOOKUP_CONDITION) {
                    return { tab: "Lookup Condition", selector: (f) => `.lookupCondition-gridContainer .ui-jqgrid tr td[title~="${CSS.escape(f.field.leftOperand)}"]` };
                }
                return { tab: "Return Fields", selector: (f) => `.ui-jqgrid tr td[title~="${CSS.escape(f.field.name)}"]` };
            }
        }),

        // --- Handlers with Complex Custom Logic ---        
        [CL.SQL]: createHandler({
            search: (nodeObj, query, options) => {
                const results = [];
                if (options.searchInFields) {
                    results.push(
                        ...(nodeObj.fields || [])
                            .filter(field => field.fieldType === 'OUT' && field.name.toLowerCase().includes(query))
                            .map(field => ({ field, isSearchResult: true }))
                    );
                }
                if (options.searchInExpressions) {
                    if (nodeObj.dataAdapter?.sql?.toLowerCase().includes(query)) {
                        results.push({
                            field: { name: nodeObj.dataAdapter.sql },
                            isSearchResult: true,
                            tab: "SQL",
                            icon: 'CODE'
                        });
                    }
                }
                return results;
            },
            getClickConfig: (fieldObj) => {
                if (fieldObj.tab === "SQL") {
                    return { tab: "SQL", selector: null };
                }
                return { tab: "Output Fields" };
            }
        }),
        [CL.HIERARCHY_PARSER]: createHandler({
            search: (nodeObj, query, options) => {
                if (!options.searchInFields) return [];
                return getValuesByPath(nodeObj, 'xFieldMap.mappings').flatMap(mapping =>
                    (mapping.xfields || [])
                        .filter(field => field.name.toLowerCase().includes(query))
                        .map(field => ({ field, groupName: mapping.groupName, isSearchResult: true }))
                );
            },
            getClickConfig: () => ({
                tab: "Output Fields",
                selector: (f) => `.fancytree-container tr td.col-editable:textEquals("${f.field.name}")`,
                groupSelector: (f) => `.fancytree-container tr td .fancytree-title:textEquals("${f.groupName}")`,
                highlightClass: "tm-search-highlight-field"
            }),
            preHighlightAction: async (fieldObj, panelElement, clickConfig) => {
                if (fieldObj.groupName && clickConfig.groupSelector) {
                    const groupCell = await waitForElement(panelElement, clickConfig.groupSelector(fieldObj));
                    const group = $(groupCell).closest('tr').get(0);
                    group?.ftnode?.setExpanded();
                }
            }
        }),
        [CL.STRUCTURE_PARSER]: createHandler({
            search: (nodeObj, query, options) => {
                if (!options.searchInFields) return [];
                const results = [];
                results.push(
                    ...(nodeObj.outputGroups || [])
                        .flatMap(group =>
                            (group.fields || [])
                                .filter(field => field.name.toLowerCase().includes(query))
                                .map(field => ({ field, groupName: group.name, isSearchResult: true }))
                        )
                );
                results.push(
                    ...(nodeObj.fieldMapping.fields || [])
                        .filter(field => field.name.toLowerCase().includes(query))
                        .map(field => ({ field, direction: "in", isSearchResult: true }))
                );
                results.push(
                    ...(nodeObj.inputGroups || [])
                        .flatMap(group =>
                            (group.fields || [])
                                .filter(field => field.name.toLowerCase().includes(query))
                                .map(field => ({ field, direction: "in", isSearchResult: true }))
                        )
                );
                return results;

            },
            getClickConfig: (fieldObj) => {
                if (fieldObj.direction === 'in') {
                    return {
                        tab: "Field Mapping",
                        selector: (f) => `.fieldMapping-right-pane .ui-jqgrid tr td:textEquals("${f.field.name}")`,
                    }
                }
                else {
                    return {
                        tab: "Output Fields",
                        selector: (f) => `.fancytree-container tr td:textEquals("${f.field.name}")`,
                        groupSelector: (f) => `.fancytree-container tr td .fancytree-title:textEquals("${f.groupName}")`,
                        highlightClass: "tm-search-highlight-field"
                    }
                }
            },
            preHighlightAction: async (fieldObj, panelElement, clickConfig) => {
                if (fieldObj.groupName && clickConfig.groupSelector) {
                    const groupCell = await waitForElement(panelElement, clickConfig.groupSelector(fieldObj));
                    const group = $(groupCell).closest('tr').get(0);
                    group?.ftnode?.setExpanded();
                }
            }
        }),
        [CL.WEB_SERVICES]: createHandler({
            search: (nodeObj, query, options) => {
                const results = [];
                results.push(
                    ...(nodeObj.outputFieldMap?.mappings || [])
                        .flatMap(group =>
                            (group.xfields || [])
                                .filter(field => field.name.toLowerCase().includes(query))
                                .map(field => ({ field, groupName: group.groupName, isSearchResult: true }))
                        )
                );
                results.push(
                    ...(nodeObj.fieldMap?.mappings || [])
                        .flatMap(group =>
                            (group.xfields || [])
                                .filter(field => field.name.toLowerCase().includes(query))
                                .map(field => ({ field, groupName: group.groupName, isSearchResult: true, tab: "requestMapping" }))
                        )
                );
                return results;
            },
            getClickConfig: (fieldObj) => {
                if (fieldObj.tab === 'requestMapping') {
                    return {
                        tab: "Request Mapping",
                        selector: (f) => `.fancytree-container tr td .fancytree-title:textEquals("${f.field.name}")`,
                        groupSelector: (f) => `.fancytree-container tr td .fancytree-title:textEquals("${f.groupName}")`,
                    }
                }
                else {
                    return {
                        tab: "Output Fields",
                        selector: (f) => `.fancytree-container tr td:textEquals("${f.field.name}")`,
                        groupSelector: (f) => `.fancytree-container tr td .fancytree-title:textEquals("${f.groupName}")`,
                        highlightClass: "tm-search-highlight-field"
                    }
                }
            },
            preHighlightAction: async (fieldObj, panelElement, clickConfig) => {
                if (fieldObj.groupName && clickConfig.groupSelector) {
                    const groupCell = await waitForElement(panelElement, clickConfig.groupSelector(fieldObj));
                    const group = $(groupCell).closest('tr').get(0);
                    group?.ftnode?.setExpanded();
                }
            },
            postHighlightAction: async (fieldObj, panelElement, clickConfig) => {
                await waitForElement(panelElement, `div.fieldMapperTgt span.fancytree-title:textEquals("root*")`);
                const element = await waitForElement(panelElement, clickConfig.selector(fieldObj));
                $(element).click();
            }
        }),
        [CL.HIERARCHY_BUILDER]: createHandler({
            search: (nodeObj, query, options) => {
                if (!options.searchInFields) return [];
                return (nodeObj.xFieldMap?.mappings || [])
                    .flatMap(group =>
                        (group.xfields || [])
                            .filter(field => field.name.toLowerCase().includes(query))
                            .map(field => ({ field, groupName: group.groupName, isSearchResult: true }))
                    )

            },
            getClickConfig: (fieldObj) => {
                return {
                    tab: "Field Mapping",
                    selector: (f) => `.fancytree-container tr td .fancytree-title:textEquals("${f.field.name}")`,
                    groupSelector: (f) => `.fancytree-container tr td .fancytree-title:textEquals("${f.groupName}")`,
                }

            },
            preHighlightAction: async (fieldObj, panelElement, clickConfig) => {
                if (fieldObj.groupName && clickConfig.groupSelector) {
                    const groupCell = await waitForElement(panelElement, clickConfig.groupSelector(fieldObj));
                    const group = $(groupCell).closest('tr').get(0);
                    group?.ftnode?.setExpanded();
                }
            },
            postHighlightAction: async (fieldObj, panelElement, clickConfig) => {
                await waitForElement(panelElement, `div.fieldMapperTgt span.fancytree-title:textEquals("root*")`);
                const element = await waitForElement(panelElement, clickConfig.selector(fieldObj));
                $(element).click();
            }
        }),
        [CL.HIERARCHY_PROCESSOR]: createHandler({
            search: (nodeObj, query, options) => {
                if (!options.searchInFields) return [];
                return (nodeObj.outputGroups || [])
                    .flatMap(group =>
                        (group.outputFields || [])
                            .filter(field => field.name.toLowerCase().includes(query))
                            .map(field => ({ field, groupName: group.name, isSearchResult: true }))
                    )
            },
            getClickConfig: (fieldObj) => {
                return {
                    tab: "Hierarchy Processor",
                    selector: (f) => `.hprocessorOutputFieldsGridParentContainer .ui-jqgrid tr td[title~="${CSS.escape(f.field.name)}"]`,
                    groupSelector: (f) => `.hprocessorOutputFieldsGridParentContainer .ui-jqgrid tr td[title~="${f.groupName}"]`,
                    scrollContainerSelector: '.ui-jqgrid-bdiv',
                    scrollOptions: { behavior: "smooth", block: "center" }
                }
            },
            preHighlightAction: async (fieldObj, panelElement, clickConfig, portlet) => {
                InformaticaAPI.setPropertyPanelHeight(portlet, 500);
                if (fieldObj.groupName && clickConfig.groupSelector) {
                    const groupCell = await waitForElement(panelElement, clickConfig.groupSelector(fieldObj));
                    const groupRow = $(groupCell).closest('tr');

                    if (groupRow.find('.tree-plus.treeclick').length > 0) {
                        groupRow.find('.tree-plus.treeclick').click();
                        await waitForElement(panelElement, clickConfig.selector(fieldObj));
                    }
                }
            }
        }),
    };

    return { CL, fieldIconMap, nodeTypeHandlers };
}