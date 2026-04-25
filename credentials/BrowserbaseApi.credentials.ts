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
			required: false,
			description: 'Optional. Provide your own model API key, or leave blank to use the <a href="https://docs.browserbase.com/platform/model-gateway/overview">Browserbase Model Gateway</a>.',
		},
		{
			displayName: 'Disable Session Recording',
			name: 'disableSessionRecording',
			type: 'boolean',
			default: false,
			description: 'Whether to force-disable session recording for all workflows using this credential. When enabled, the per-node "Record Session" option is ignored and recording is always off.',
		},
		{
			displayName: 'Disable Session Logging',
			name: 'disableSessionLogging',
			type: 'boolean',
			default: false,
			description: 'Whether to force-disable session logging for all workflows using this credential. When enabled, the per-node "Log Session" option is ignored and logging is always off.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-bb-api-key': '={{$credentials.browserbaseApiKey}}',
			},
		},
	};

}
