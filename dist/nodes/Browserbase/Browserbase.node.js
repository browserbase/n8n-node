"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Browserbase = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const BASE_URL = 'https://api.stagehand.browserbase.com';
class Browserbase {
    constructor() {
        this.description = {
            displayName: 'Browserbase Agent',
            name: 'browserbase',
            icon: 'file:../../icons/browserbase.svg',
            group: ['transform'],
            version: 2,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["mode"]}}',
            description: 'AI-powered browser automation. Provide a URL and instruction, get results. Supports CUA (vision), DOM (selectors), and Hybrid modes.',
            defaults: {
                name: 'Browserbase Agent',
            },
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            usableAsTool: true,
            credentials: [
                {
                    name: 'browserbaseApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Agent',
                            value: 'agent',
                        },
                    ],
                    default: 'agent',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                        },
                    },
                    options: [
                        {
                            name: 'Execute',
                            value: 'execute',
                            description: 'Execute an AI agent to perform browser automation tasks',
                            action: 'Execute an agent',
                        },
                    ],
                    default: 'execute',
                },
                {
                    displayName: 'Mode Info',
                    name: 'modeNotice',
                    type: 'notice',
                    default: '',
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                        },
                    },
                    description: 'CUA uses vision/coordinates (best for complex UIs). DOM uses selectors (faster, any LLM). Hybrid combines both.',
                },
                {
                    displayName: 'Starting URL',
                    name: 'url',
                    type: 'string',
                    default: '',
                    required: true,
                    placeholder: 'e.g. https://example.com',
                    description: 'The starting page URL for the agent',
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                        },
                    },
                },
                {
                    displayName: 'Instruction',
                    name: 'instruction',
                    type: 'string',
                    typeOptions: {
                        rows: 4,
                    },
                    default: '',
                    required: true,
                    placeholder: 'e.g. Find the pricing page and extract all plan names and prices',
                    description: 'The task for the agent to complete',
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                        },
                    },
                },
                {
                    displayName: 'Model Info',
                    name: 'modelNotice',
                    type: 'notice',
                    default: '',
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                        },
                    },
                    description: 'Driver Model is used for the actual primitive operations. Agent Model is used for orchestration. For now pick both models from the same provider.',
                },
                {
                    displayName: 'Driver Model',
                    name: 'driverModel',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                        },
                    },
                    options: [
                        {
                            name: 'Claude Sonnet 4.5 (Anthropic)',
                            value: 'anthropic/claude-sonnet-4-5-20250929',
                        },
                        {
                            name: 'Gemini 2.5 Flash (Google) - Recommended',
                            value: 'google/gemini-2.5-flash',
                        },
                        {
                            name: 'Gemini 2.5 Pro (Google)',
                            value: 'google/gemini-2.5-pro',
                        },
                        {
                            name: 'GPT-4o (OpenAI)',
                            value: 'openai/gpt-4o',
                        },
                        {
                            name: 'GPT-4o Mini (OpenAI)',
                            value: 'openai/gpt-4o-mini',
                        },
                    ],
                    default: 'google/gemini-2.5-flash',
                    description: 'Model for browser session (DOM-based, used for navigation)',
                },
                {
                    displayName: 'Mode',
                    name: 'mode',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                        },
                    },
                    options: [
                        {
                            name: 'CUA (Computer Use Agent)',
                            value: 'cua',
                            description: 'Uses vision and coordinates. Works with CUA-specific models.',
                        },
                        {
                            name: 'DOM',
                            value: 'dom',
                            description: 'Uses DOM selectors. Works with any LLM. Faster.',
                        },
                        {
                            name: 'Hybrid (Experimental)',
                            value: 'hybrid',
                            description: 'Combines vision and DOM. Requires specific models.',
                        },
                    ],
                    default: 'cua',
                    description: 'Agent mode determines how the agent interacts with pages',
                },
                {
                    displayName: 'Agent Model',
                    name: 'modelCua',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                            mode: ['cua'],
                        },
                    },
                    options: [
                        {
                            name: 'Claude Haiku 4.5 (Anthropic) - Fastest',
                            value: 'anthropic/claude-haiku-4-5-20251001',
                        },
                        {
                            name: 'Claude Sonnet 4 (Anthropic)',
                            value: 'anthropic/claude-sonnet-4-20250514',
                        },
                        {
                            name: 'Claude Sonnet 4.5 (Anthropic)',
                            value: 'anthropic/claude-sonnet-4-5-20250929',
                        },
                        {
                            name: 'Computer Use Preview (OpenAI)',
                            value: 'openai/computer-use-preview',
                        },
                        {
                            name: 'Gemini 2.5 CUA (Google) - Recommended',
                            value: 'google/gemini-2.5-computer-use-preview-10-2025',
                        },
                    ],
                    default: 'google/gemini-2.5-computer-use-preview-10-2025',
                    description: 'CUA model for vision-based browser control',
                },
                {
                    displayName: 'Agent Model',
                    name: 'modelDom',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                            mode: ['dom'],
                        },
                    },
                    options: [
                        {
                            name: 'Claude Sonnet 4.5 (Anthropic)',
                            value: 'anthropic/claude-sonnet-4-5-20250929',
                        },
                        {
                            name: 'Gemini 2.5 Flash (Google) - Fast & Cheap',
                            value: 'google/gemini-2.5-flash',
                        },
                        {
                            name: 'Gemini 2.5 Pro (Google) - Most Capable',
                            value: 'google/gemini-2.5-pro',
                        },
                        {
                            name: 'GPT-4o (OpenAI)',
                            value: 'openai/gpt-4o',
                        },
                        {
                            name: 'GPT-4o Mini (OpenAI) - Budget',
                            value: 'openai/gpt-4o-mini',
                        },
                    ],
                    default: 'google/gemini-2.5-flash',
                    description: 'LLM for DOM-based browser control',
                },
                {
                    displayName: 'Agent Model',
                    name: 'modelHybrid',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                            mode: ['hybrid'],
                        },
                    },
                    options: [
                        {
                            name: 'Gemini 3 Flash (Google) - Recommended',
                            value: 'google/gemini-3-flash-preview',
                        },
                        {
                            name: 'Claude Sonnet 4 (Anthropic)',
                            value: 'anthropic/claude-sonnet-4-20250514',
                        },
                        {
                            name: 'Claude Haiku 4.5 (Anthropic)',
                            value: 'anthropic/claude-haiku-4-5-20251001',
                        },
                    ],
                    default: 'google/gemini-3-flash-preview',
                    description: 'Model for hybrid mode (must support coordinate actions)',
                },
                {
                    displayName: 'Options',
                    name: 'options',
                    type: 'collection',
                    placeholder: 'Add Option',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Highlight Cursor',
                            name: 'highlightCursor',
                            type: 'boolean',
                            default: true,
                            description: 'Whether to highlight the cursor during execution (CUA/Hybrid only)',
                        },
                        {
                            displayName: 'Max Steps',
                            name: 'maxSteps',
                            type: 'number',
                            default: 20,
                            description: 'Maximum number of steps the agent can take',
                        },
                        {
                            displayName: 'System Prompt',
                            name: 'systemPrompt',
                            type: 'string',
                            typeOptions: {
                                rows: 4,
                            },
                            default: '',
                            placeholder: 'e.g. You are a helpful assistant that extracts data from websites',
                            description: 'Custom system prompt for the agent',
                        },
                    ],
                },
                {
                    displayName: 'Browser Options',
                    name: 'browserOptions',
                    type: 'collection',
                    placeholder: 'Add Option',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Advanced Stealth',
                            name: 'advancedStealth',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to enable advanced stealth mode to avoid bot detection',
                        },
                        {
                            displayName: 'Block Ads',
                            name: 'blockAds',
                            type: 'boolean',
                            default: true,
                            description: 'Whether to block ads during browsing',
                        },
                        {
                            displayName: 'Record Session',
                            name: 'recordSession',
                            type: 'boolean',
                            default: true,
                            description: 'Whether to record the browser session for replay',
                        },
                        {
                            displayName: 'Solve Captchas',
                            name: 'solveCaptchas',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to automatically solve captchas encountered during execution',
                        },
                        {
                            displayName: 'Viewport Height',
                            name: 'viewportHeight',
                            type: 'number',
                            default: 711,
                            description: 'Browser viewport height in pixels (711 recommended for CUA)',
                        },
                        {
                            displayName: 'Viewport Width',
                            name: 'viewportWidth',
                            type: 'number',
                            default: 1288,
                            description: 'Browser viewport width in pixels (1288 recommended for CUA)',
                        },
                    ],
                },
                {
                    displayName: 'Session Options',
                    name: 'sessionOptions',
                    type: 'collection',
                    placeholder: 'Add Option',
                    default: {},
                    displayOptions: {
                        show: {
                            resource: ['agent'],
                            operation: ['execute'],
                        },
                    },
                    options: [
                        {
                            displayName: 'Region',
                            name: 'region',
                            type: 'options',
                            options: [
                                { name: 'AP South 1', value: 'ap-south-1' },
                                { name: 'EU West 1', value: 'eu-west-1' },
                                { name: 'US East 1', value: 'us-east-1' },
                                { name: 'US West 2', value: 'us-west-2' },
                            ],
                            default: 'us-west-2',
                            description: 'The region where the browser session will run',
                        },
                        {
                            displayName: 'Timeout',
                            name: 'timeout',
                            type: 'number',
                            default: 300,
                            description: 'Session timeout in seconds',
                        },
                        {
                            displayName: 'Use Proxies',
                            name: 'proxies',
                            type: 'boolean',
                            default: true,
                            description: 'Whether to route traffic through proxies',
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            try {
                let url = this.getNodeParameter('url', i);
                if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                    url = `https://${url}`;
                }
                const instruction = this.getNodeParameter('instruction', i);
                const driverModel = this.getNodeParameter('driverModel', i);
                const mode = this.getNodeParameter('mode', i);
                let agentModel;
                if (mode === 'cua') {
                    agentModel = this.getNodeParameter('modelCua', i);
                }
                else if (mode === 'dom') {
                    agentModel = this.getNodeParameter('modelDom', i);
                }
                else {
                    agentModel = this.getNodeParameter('modelHybrid', i);
                }
                const options = this.getNodeParameter('options', i, {});
                const browserOptions = this.getNodeParameter('browserOptions', i, {});
                const sessionOptions = this.getNodeParameter('sessionOptions', i, {});
                const credentials = await this.getCredentials('browserbaseApi');
                const headers = {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'x-bb-api-key': credentials.browserbaseApiKey,
                    'x-bb-project-id': credentials.browserbaseProjectId,
                    'x-model-api-key': credentials.modelApiKey,
                };
                const apiCall = async (method, endpoint, body) => {
                    const fullUrl = `${BASE_URL}${endpoint}`;
                    try {
                        const response = await this.helpers.httpRequest({
                            method,
                            url: fullUrl,
                            headers,
                            body,
                            json: true,
                        });
                        return response;
                    }
                    catch (error) {
                        const err = error;
                        throw err;
                    }
                };
                let sessionId;
                try {
                    const startBody = {
                        modelName: driverModel,
                        apiKey: credentials.modelApiKey,
                        browserbaseSessionCreateParams: {
                            browserSettings: {
                                recordSession: (_a = browserOptions.recordSession) !== null && _a !== void 0 ? _a : true,
                                solveCaptchas: (_b = browserOptions.solveCaptchas) !== null && _b !== void 0 ? _b : false,
                                blockAds: (_c = browserOptions.blockAds) !== null && _c !== void 0 ? _c : true,
                                advancedStealth: (_d = browserOptions.advancedStealth) !== null && _d !== void 0 ? _d : false,
                                viewport: {
                                    width: (_e = browserOptions.viewportWidth) !== null && _e !== void 0 ? _e : 1288,
                                    height: (_f = browserOptions.viewportHeight) !== null && _f !== void 0 ? _f : 711,
                                },
                            },
                            region: (_g = sessionOptions.region) !== null && _g !== void 0 ? _g : 'us-west-2',
                            timeout: (_h = sessionOptions.timeout) !== null && _h !== void 0 ? _h : 300,
                            proxies: (_j = sessionOptions.proxies) !== null && _j !== void 0 ? _j : true,
                        },
                    };
                    const startResponse = await apiCall('POST', '/v1/sessions/start', startBody);
                    sessionId =
                        (_m = (_l = (_k = startResponse.data) === null || _k === void 0 ? void 0 : _k.sessionId) !== null && _l !== void 0 ? _l : startResponse.sessionId) !== null && _m !== void 0 ? _m : startResponse.id;
                    if (!sessionId) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Failed to get session ID from start response');
                    }
                    await apiCall('POST', `/v1/sessions/${sessionId}/navigate`, {
                        url,
                        options: {
                            waitUntil: 'domcontentloaded',
                        },
                    });
                    const provider = agentModel.split('/')[0];
                    const executeBody = {
                        agentConfig: {
                            provider,
                            model: {
                                modelName: agentModel,
                                apiKey: credentials.modelApiKey
                            },
                            cua: mode === 'cua' || mode === 'hybrid',
                        },
                        executeOptions: {
                            instruction,
                            maxSteps: (_o = options.maxSteps) !== null && _o !== void 0 ? _o : 20,
                        },
                    };
                    if (options.systemPrompt) {
                        executeBody.agentConfig.systemPrompt =
                            options.systemPrompt;
                    }
                    if ((mode === 'cua' || mode === 'hybrid') &&
                        options.highlightCursor !== false) {
                        executeBody.executeOptions.highlightCursor =
                            (_p = options.highlightCursor) !== null && _p !== void 0 ? _p : true;
                    }
                    const executeResponse = await apiCall('POST', `/v1/sessions/${sessionId}/agentExecute`, executeBody);
                    await apiCall('POST', `/v1/sessions/${sessionId}/end`, {});
                    const result = (_r = (_q = executeResponse.data) === null || _q === void 0 ? void 0 : _q.result) !== null && _r !== void 0 ? _r : executeResponse;
                    returnData.push({
                        json: {
                            success: (_s = result.success) !== null && _s !== void 0 ? _s : true,
                            message: (_t = result.message) !== null && _t !== void 0 ? _t : 'Task completed',
                            actions: (_u = result.actions) !== null && _u !== void 0 ? _u : [],
                            completed: (_v = result.completed) !== null && _v !== void 0 ? _v : true,
                            usage: (_w = result.usage) !== null && _w !== void 0 ? _w : {},
                            sessionId,
                        },
                        pairedItem: { item: i },
                    });
                }
                catch (error) {
                    if (sessionId) {
                        try {
                            await apiCall('POST', `/v1/sessions/${sessionId}/end`, {});
                        }
                        catch {
                        }
                    }
                    throw error;
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            success: false,
                            error: error instanceof Error ? error.message : String(error),
                        },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.Browserbase = Browserbase;
//# sourceMappingURL=Browserbase.node.js.map