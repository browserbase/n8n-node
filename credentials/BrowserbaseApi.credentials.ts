import type {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BrowserbaseApi implements ICredentialType {
	name = 'browserbaseApi';

	displayName = 'Browserbase API';

	documentationUrl = 'https://docs.browserbase.com';

	icon = 'file:../icons/browserbase.svg' as const;

	properties: INodeProperties[] = [
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
			displayName: 'Browserbase Project ID (Deprecated)',
			name: 'browserbaseProjectId',
			type: 'string',
			default: '',
			required: false,
			description: 'Optional. Your Browserbase project ID (no longer required for new setups)',
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

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-bb-api-key': '={{$credentials.browserbaseApiKey}}',
				'x-model-api-key': '={{$credentials.modelApiKey}}',
			},
		},
	};

}
