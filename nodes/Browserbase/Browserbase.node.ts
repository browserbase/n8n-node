import {
	NodeConnectionTypes,
	type ICredentialDataDecryptedObject,
	type ICredentialTestFunctions,
	type ICredentialsDecrypted,
	type IExecuteFunctions,
	type INodeCredentialTestResult,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type IHttpRequestMethods,
	NodeOperationError,
} from 'n8n-workflow';

const BASE_URL = 'https://api.stagehand.browserbase.com';

export class Browserbase implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Browserbase Agent',
		name: 'browserbase',
		icon: 'file:../../icons/browserbase.svg',
		group: ['transform'],
		version: 2,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["mode"]}}',
		description:
			'AI-powered browser automation. Provide a URL and instruction, get results. Supports CUA (vision), DOM (selectors), and Hybrid modes.',
		defaults: {
			name: 'Browserbase Agent',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'browserbaseApi',
				required: true,
				testedBy: 'browserbaseApiTest',
			},
		],
		properties: [
			// Resource
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
			// Operation
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
			// Notice about modes
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
				description:
					'CUA uses vision/coordinates (best for complex UIs). DOM uses selectors (faster, any LLM). Hybrid combines both.',
			},
			// Primary fields
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
				displayName: 'Model Source',
				name: 'modelSource',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['agent'],
						operation: ['execute'],
					},
				},
				options: [
					{
						name: 'Model Gateway (Browserbase)',
						value: 'gateway',
						description: 'Use Browserbase-managed model routing. Mix any providers freely.',
					},
					{
						name: 'User-Provided API Key',
						value: 'userProvidedKey',
						description: 'Use your own model API key from credentials. Same provider required for both models.',
					},
				],
				default: 'gateway',
				description: 'Choose how model calls are routed. Model Gateway lets you mix providers; User-provided API key requires both models from the same provider.',
			},
			{
				displayName: 'Model Info',
				name: 'modelNoticeGateway',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						resource: ['agent'],
						operation: ['execute'],
						modelSource: ['gateway'],
					},
				},
				description:
					'Using the Browserbase Model Gateway. You can freely mix models from different providers for Driver and Agent.',
			},
			{
				displayName: 'Model Info',
				name: 'modelNoticeBYOK',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						resource: ['agent'],
						operation: ['execute'],
						modelSource: ['userProvidedKey'],
					},
				},
				description:
					'Using your own API key from credentials. Both Driver and Agent models MUST be from the same provider.',
			},
			// Driver Model for session start
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
						name: 'Claude Haiku 4.5 (Anthropic)',
						value: 'anthropic/claude-haiku-4-5',
					},
					{
						name: 'Claude Opus 4.6 (Anthropic)',
						value: 'anthropic/claude-opus-4-6',
					},
					{
						name: 'Claude Sonnet 4.6 (Anthropic)',
						value: 'anthropic/claude-sonnet-4-6',
					},
					{
						name: 'Gemini 3 Flash (Google)',
						value: 'google/gemini-3-flash',
					},
					{
						name: 'Gemini 3 Pro (Google)',
						value: 'google/gemini-3-pro',
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
				default: 'anthropic/claude-sonnet-4-6',
				description: 'Model for browser session (DOM-based, used for navigation)',
			},
			// Mode selection
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
						description:
							'Uses vision and coordinates. Works with CUA-specific models.',
					},
					{
						name: 'DOM',
						value: 'dom',
						description: 'Uses DOM selectors. Works with any LLM. Faster.',
					},
					{
						name: 'Hybrid (Experimental)',
						value: 'hybrid',
						description:
							'Combines vision and DOM. Requires specific models.',
					},
				],
				default: 'cua',
				description: 'Agent mode determines how the agent interacts with pages',
			},
			// CUA Models
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
						name: 'Claude Haiku 4.5 (Anthropic)',
						value: 'anthropic/claude-haiku-4-5',
					},
					{
						name: 'Claude Opus 4.6 (Anthropic)',
						value: 'anthropic/claude-opus-4-6',
					},
					{
						name: 'Claude Sonnet 4.6 (Anthropic)',
						value: 'anthropic/claude-sonnet-4-6',
					},
					{
						name: 'Computer Use Preview (2025-03-11, OpenAI)',
						value: 'openai/computer-use-preview-2025-03-11',
					},
					{
						name: 'Computer Use Preview (OpenAI)',
						value: 'openai/computer-use-preview',
					},
					{
						name: 'Gemini 2.5 CUA (Google)',
						value: 'google/gemini-2.5-computer-use-preview-10-2025',
					},
					{
						name: 'Gemini 3 Flash (Google)',
						value: 'google/gemini-3-flash-preview',
					},
					{
						name: 'Gemini 3 Pro (Google)',
						value: 'google/gemini-3-pro-preview',
					},
				],
				default: 'anthropic/claude-sonnet-4-6',
				description: 'CUA model for vision-based browser control',
			},
			// DOM Models
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
						name: 'Claude Sonnet 4.6 (Anthropic)',
						value: 'anthropic/claude-sonnet-4-6',
					},
					{
						name: 'Gemini 3 Flash (Google)',
						value: 'google/gemini-3-flash-preview',
					},
					{
						name: 'Gemini 3 Pro (Google)',
						value: 'google/gemini-3-pro-preview',
					},
					{
						name: 'GPT-4.1 (OpenAI)',
						value: 'openai/gpt-4.1',
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
				default: 'anthropic/claude-sonnet-4-6',
				description: 'LLM for DOM-based browser control',
			},
			// Hybrid Models
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
						name: 'Gemini 3 Flash (Google)',
						value: 'google/gemini-3-flash-preview',
					},
					{
						name: 'Claude Sonnet 4.6 (Anthropic)',
						value: 'anthropic/claude-sonnet-4-6',
					},
					{
						name: 'Claude Haiku 4.5 (Anthropic)',
						value: 'anthropic/claude-haiku-4-5-20251001',
					},
				],
				default: 'anthropic/claude-sonnet-4-6',
				description: 'Model for hybrid mode (must support coordinate actions)',
			},
			// Options collection (combines agent options)
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
						description:
							'Whether to highlight the cursor during execution (CUA/Hybrid only)',
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
			// Variables
			{
				displayName: 'Variables',
				name: 'variables',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				placeholder: 'Add Variable',
				description:
					'Pass sensitive data to the agent. The LLM sees %variableName% placeholders and descriptions, but never the actual values.',
				displayOptions: {
					show: {
						resource: ['agent'],
						operation: ['execute'],
						mode: ['dom', 'hybrid'],
					},
				},
				options: [
					{
						name: 'variableValues',
						displayName: 'Variable',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'e.g. username',
								description: 'Variable name (used as %name% in instructions)',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								typeOptions: { password: true },
								placeholder: 'e.g. john@example.com',
								description: 'The actual value (never shown to the LLM)',
							},
							{
								displayName: 'Description',
								name: 'description',
								type: 'string',
								default: '',
								placeholder: 'e.g. The login email address',
								description:
									'Optional description visible to the LLM to understand what this variable is for',
							},
						],
					},
				],
			},
			// Browser Options
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
						displayName: 'Log Session',
						name: 'logSession',
						type: 'boolean',
						default: true,
						description: 'Whether to enable session logging',
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
			// Session Options
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
						displayName: 'Context ID',
						name: 'contextId',
						type: 'string',
						default: '',
						placeholder: 'e.g. ctx_abc123',
						description: 'Reuse cookies, auth, and cached data across sessions. Create a context via the Browserbase Contexts API first.',
					},
					{
						displayName: 'Keep Alive',
						name: 'keepAlive',
						type: 'boolean',
						default: false,
						description: 'Whether to keep the session alive even after disconnections. Available on Hobby plan and above.',
					},
					{
						displayName: 'Persist Context',
						name: 'persistContext',
						type: 'boolean',
						default: true,
						description: 'Whether to save session changes (cookies, auth tokens, cache) back to the context when the session ends. Only used when Context ID is set.',
					},
					{
						displayName: 'Region',
						name: 'region',
						type: 'options',
						options: [
							{ name: 'AP Southeast 1 (Singapore)', value: 'ap-southeast-1' },
							{ name: 'EU Central 1 (Frankfurt)', value: 'eu-central-1' },
							{ name: 'US East 1 (Virginia)', value: 'us-east-1' },
							{ name: 'US West 2 (Oregon)', value: 'us-west-2' },
						],
						default: 'us-west-2',
						description: 'Region where the browser session will run',
					},
					{
						displayName: 'Timeout',
						name: 'timeout',
						type: 'number',
						default: 300,
						typeOptions: {
							minValue: 60,
							maxValue: 21600,
						},
						description: 'Session timeout in seconds (60-21600)',
					},
					{
						displayName: 'Use Proxies',
						name: 'proxies',
						type: 'boolean',
						default: true,
						description: 'Whether to route traffic through proxies',
					},
					{
						displayName: 'User Metadata',
						name: 'userMetadata',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						placeholder: '{"key": "value"}',
						description: 'Arbitrary JSON metadata to attach to the session',
					},
				],
			},
		],
	};

	methods = {
		credentialTest: {
			async browserbaseApiTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted<ICredentialDataDecryptedObject>,
			): Promise<INodeCredentialTestResult> {
				const { browserbaseApiKey, browserbaseProjectId, modelApiKey } =
					credential.data!;

				const headers: Record<string, string> = {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'x-bb-api-key': browserbaseApiKey as string,
				};
				if (modelApiKey) {
					headers['x-model-api-key'] = modelApiKey as string;
				}
				const projectId = (browserbaseProjectId as string)?.trim();
				if (projectId) {
					headers['x-bb-project-id'] = projectId;
				}

				let sessionId: string | undefined;

				const httpRequest = this.helpers[
					'request' as keyof typeof this.helpers
				] as (opts: object) => Promise<Record<string, unknown>>;

				try {
					const startResponse = await httpRequest({
						method: 'POST',
						uri: `${BASE_URL}/v1/sessions/start`,
						headers,
						body: { modelName: 'openai/gpt-4o' },
						json: true,
					});

					const data = startResponse.data as Record<string, unknown> | undefined;
					sessionId = (data?.sessionId ??
						startResponse.sessionId ??
						startResponse.id) as string | undefined;

					if (sessionId) {
						await httpRequest({
							method: 'POST',
							uri: `${BASE_URL}/v1/sessions/${sessionId}/end`,
							headers,
							body: {},
							json: true,
						});
					}

					return { status: 'OK', message: 'Connection successful' };
				} catch (error) {
					if (sessionId) {
						try {
							await httpRequest({
								method: 'POST',
								uri: `${BASE_URL}/v1/sessions/${sessionId}/end`,
								headers,
								body: {},
								json: true,
							});
						} catch {
							// Ignore cleanup errors
						}
					}

					const msg =
						error instanceof Error ? error.message : String(error);
					return { status: 'Error', message: msg };
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				// Get parameters
				let url = this.getNodeParameter('url', i) as string;
				// Ensure URL has protocol
				if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
					url = `https://${url}`;
				}
				const instruction = this.getNodeParameter('instruction', i) as string;
				const modelSource = this.getNodeParameter('modelSource', i) as string;
				const driverModel = this.getNodeParameter('driverModel', i) as string;
				const mode = this.getNodeParameter('mode', i) as string;

				let agentModel: string;
				if (mode === 'cua') {
					agentModel = this.getNodeParameter('modelCua', i) as string;
				} else if (mode === 'dom') {
					agentModel = this.getNodeParameter('modelDom', i) as string;
				} else {
					agentModel = this.getNodeParameter('modelHybrid', i) as string;
				}

				if (modelSource === 'userProvidedKey') {
					const driverProvider = driverModel.split('/')[0];
					const agentProvider = agentModel.split('/')[0];
					if (driverProvider !== agentProvider) {
						throw new NodeOperationError(
							this.getNode(),
							`When using your own model API key, both Driver and Agent models must be from the same provider. Driver is "${driverProvider}", Agent is "${agentProvider}".`,
						);
					}
				}

				const options = this.getNodeParameter('options', i, {}) as {
					maxSteps?: number;
					systemPrompt?: string;
					highlightCursor?: boolean;
				};
				const browserOptions = this.getNodeParameter(
					'browserOptions',
					i,
					{},
				) as {
					recordSession?: boolean;
					solveCaptchas?: boolean;
					blockAds?: boolean;
					advancedStealth?: boolean;
					viewportWidth?: number;
					viewportHeight?: number;
					logSession?: boolean;
					os?: string;
				};
				const sessionOptions = this.getNodeParameter(
					'sessionOptions',
					i,
					{},
				) as {
					region?: string;
					timeout?: number;
					proxies?: boolean;
					contextId?: string;
					persistContext?: boolean;
					keepAlive?: boolean;
					userMetadata?: string;
				};

				const credentials = await this.getCredentials('browserbaseApi');
				const headers: Record<string, string> = {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'x-bb-api-key': credentials.browserbaseApiKey as string,
				};
				if (modelSource === 'userProvidedKey') {
					const modelApiKey = credentials.modelApiKey as string;
					if (!modelApiKey) {
						throw new NodeOperationError(
							this.getNode(),
							'Model Source is set to "User-provided API key" but no Model API Key is configured in the Browserbase credentials.',
						);
					}
					headers['x-model-api-key'] = modelApiKey;
				}
				const projectId = (credentials.browserbaseProjectId as string)?.trim();
				if (projectId) {
					headers['x-bb-project-id'] = projectId;
				}

				// Helper function to make API calls
				const apiCall = async (
					method: IHttpRequestMethods,
					endpoint: string,
					body?: object,
				) => {
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
					} catch (error: unknown) {
						const err = error as { response?: { data?: unknown }; message?: string };
						const detail = err.response?.data
							? JSON.stringify(err.response.data)
							: err.message ?? 'Unknown error';
						throw new NodeOperationError(
							this.getNode(),
							`API call to ${endpoint} failed: ${detail}`,
						);
					}
				};

				let sessionId: string | undefined;

				try {
					// 1. Start session
					const browserSettings: Record<string, unknown> = {
						recordSession: browserOptions.recordSession ?? true,
						solveCaptchas: browserOptions.solveCaptchas ?? false,
						blockAds: browserOptions.blockAds ?? true,
						advancedStealth: browserOptions.advancedStealth ?? false,
						logSession: browserOptions.logSession ?? true,
						viewport: {
							width: browserOptions.viewportWidth ?? 1288,
							height: browserOptions.viewportHeight ?? 711,
						},
					};

					if (sessionOptions.contextId) {
						browserSettings.context = {
							id: sessionOptions.contextId,
							persist: sessionOptions.persistContext ?? true,
						};
					}

					if (browserOptions.os) {
						browserSettings.os = browserOptions.os;
					}

					const sessionCreateParams: Record<string, unknown> = {
						browserSettings,
						region: sessionOptions.region ?? 'us-west-2',
						timeout: sessionOptions.timeout ?? 300,
						...(sessionOptions.proxies !== false ? { proxies: true } : {}),
					};

					if (sessionOptions.keepAlive) {
						sessionCreateParams.keepAlive = true;
					}

					if (sessionOptions.userMetadata) {
						try {
							sessionCreateParams.userMetadata = { n8n: 'true', ...JSON.parse(sessionOptions.userMetadata) };
						} catch {
							sessionCreateParams.userMetadata = { n8n: 'true', note: sessionOptions.userMetadata };
						}
					} else {
						sessionCreateParams.userMetadata = { n8n: 'true' };
					}

					const startBody: Record<string, unknown> = {
						modelName: driverModel,
						browserbaseSessionCreateParams: sessionCreateParams,
					};

					const startResponse = await apiCall(
						'POST',
						'/v1/sessions/start',
						startBody,
					);
					sessionId =
						startResponse.data?.sessionId ??
						startResponse.sessionId ??
						startResponse.id;

					if (!sessionId) {
						throw new NodeOperationError(
							this.getNode(),
							'Failed to get session ID from start response',
						);
					}

					// 2. Navigate to URL
					await apiCall('POST', `/v1/sessions/${sessionId}/navigate`, {
						url,
						options: {
							waitUntil: 'domcontentloaded',
						},
					});

					// 3. Execute agent
					const agentConfigBody: Record<string, unknown> = {
						model: agentModel,
					};

					if (options.systemPrompt) {
						agentConfigBody.systemPrompt = options.systemPrompt;
					}

					const executeOpts: Record<string, unknown> = {
						instruction,
						maxSteps: options.maxSteps ?? 20,
					};

					if (
						(mode === 'cua' || mode === 'hybrid') &&
						options.highlightCursor !== false
					) {
						executeOpts.highlightCursor = options.highlightCursor ?? true;
					}

					if (mode === 'dom' || mode === 'hybrid') {
						const variablesParam = this.getNodeParameter('variables', i, {}) as {
							variableValues?: Array<{
								name: string;
								value: string;
								description?: string;
							}>;
						};

						if (variablesParam.variableValues?.length) {
							const variables: Record<string, { value: string; description?: string }> = {};
							for (const v of variablesParam.variableValues) {
								if (v.name) {
									variables[v.name] = v.description
										? { value: v.value, description: v.description }
										: { value: v.value };
								}
							}
							if (Object.keys(variables).length > 0) {
								executeOpts.variables = variables;
							}
						}
					}

					const executeResponse = await apiCall(
						'POST',
						`/v1/sessions/${sessionId}/agentExecute`,
						{
							agentConfig: agentConfigBody,
							executeOptions: executeOpts,
						},
					);

					// 4. End session
					await apiCall('POST', `/v1/sessions/${sessionId}/end`, {});

					// Return agent result
					const result = executeResponse.data?.result ?? executeResponse;
					returnData.push({
						json: {
							success: result.success ?? true,
							message: result.message ?? 'Task completed',
							actions: result.actions ?? [],
							completed: result.completed ?? true,
							usage: result.usage ?? {},
							sessionId,
							...(sessionOptions.contextId ? { contextId: sessionOptions.contextId } : {}),
						},
						pairedItem: { item: i },
					});
				} catch (error) {
					// Try to end session if it was created
					if (sessionId) {
						try {
							await apiCall('POST', `/v1/sessions/${sessionId}/end`, {});
						} catch {
							// Ignore cleanup errors
						}
					}
					throw error;
				}
			} catch (error) {
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
