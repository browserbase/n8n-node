"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserbaseApi = void 0;
class BrowserbaseApi {
    constructor() {
        this.name = 'browserbaseApi';
        this.displayName = 'Browserbase API';
        this.documentationUrl = 'https://docs.browserbase.com';
        this.icon = 'file:../icons/browserbase.svg';
        this.properties = [
            {
                displayName: 'Browserbase API Key',
                name: 'browserbaseApiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                description: 'Your Browserbase API key',
            },
            {
                displayName: 'Browserbase Project ID',
                name: 'browserbaseProjectId',
                type: 'string',
                default: '',
                required: true,
                description: 'Your Browserbase project ID',
            },
            {
                displayName: 'Model API Key',
                name: 'modelApiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                description: 'API key for the AI model (e.g., Gemini API key)',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'x-bb-api-key': '={{$credentials.browserbaseApiKey}}',
                    'x-bb-project-id': '={{$credentials.browserbaseProjectId}}',
                    'x-model-api-key': '={{$credentials.modelApiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: 'https://api.stagehand.browserbase.com',
                url: '/v1/sessions/start',
                method: 'POST',
                body: {
                    modelName: 'openai/gpt-4o',
                },
            },
        };
    }
}
exports.BrowserbaseApi = BrowserbaseApi;
//# sourceMappingURL=BrowserbaseApi.credentials.js.map