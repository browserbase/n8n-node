import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';
export declare class BrowserbaseApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    icon: "file:../icons/browserbase.svg";
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
