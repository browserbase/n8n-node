# n8n-nodes-browserbase

This is an n8n community node for [Browserbase](https://browserbase.com). It gives your workflows three Browserbase capabilities in one node:

1. `Agent`: run Stagehand-powered browser automation
2. `Search`: find relevant URLs without creating a browser session
3. `Fetch`: retrieve page content without creating a browser session

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Development / Testing with Docker

```bash
npm install
npm run build
docker-compose up --build
```

Open `http://localhost:5678` and search for `Browserbase`.

To rebuild after changes:

```bash
npm run build && docker-compose up --build
```

## Capabilities

### Agent

Use Browserbase browser sessions plus Stagehand to complete browser tasks from a prompt.

Required fields:

| Field | Description |
| --- | --- |
| `Starting URL` | The page where the agent begins |
| `Instruction` | Natural language task for the agent to complete |

The Agent resource supports:

- CUA, DOM, and Hybrid modes
- Browserbase Model Gateway or your own model API key
- Session options like region, proxies, context reuse, and keep-alive
- Variables for DOM and Hybrid flows

### Search

Use Browserbase Search to find relevant URLs quickly without launching a browser.

Required fields:

| Field | Description |
| --- | --- |
| `Query` | Search query to execute |

Optional fields:

| Field | Description |
| --- | --- |
| `Number of Results` | How many results to return, from 1 to 25 |

Search output includes:

- `requestId`
- `query`
- `results`
- `resultCount`

### Fetch

Use Browserbase Fetch to retrieve raw page content without launching a browser.

Required fields:

| Field | Description |
| --- | --- |
| `URL` | URL to fetch |

Optional fetch settings:

- Follow redirects
- Allow insecure SSL
- Use Browserbase proxies

Fetch output includes:

- `statusCode`
- `headers`
- `content`
- `contentType`
- `encoding`

## Credentials

The node uses one Browserbase credential:

| Credential | Description |
| --- | --- |
| `Browserbase API Key` | Required for all resources |
| `Browserbase Project ID (Deprecated)` | Optional legacy header |
| `Model API Key` | Optional. Only needed for Agent when using your own model provider key |

## Example Usage

### Search

- Resource: `Search`
- Query: `browserbase documentation`

### Fetch

- Resource: `Fetch`
- URL: `https://browserbase.com`

### Agent

- Resource: `Agent`
- Starting URL: `https://github.com`
- Instruction: `Search for "stagehand" and open the first repository result`

## Compatibility

Compatible with n8n `1.60.0` or later.

## Resources

- [Browserbase Documentation](https://docs.browserbase.com)
- [Fetch Overview](https://docs.browserbase.com/platform/fetch/overview)
- [Search Overview](https://docs.browserbase.com/platform/search/overview)
- [Stagehand Documentation](https://docs.stagehand.dev)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
