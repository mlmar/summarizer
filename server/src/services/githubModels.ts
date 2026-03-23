import { githubModelsConfig } from '../config/github.ts';
import type { ChatMessage, CompletionRequest, CompletionResponse, ToolDefinition } from '../types/github.ts';

/**
 * Sends a chat completion request to the GitHub Models API.
 *
 * When tools are provided the model may respond with tool_calls instead of a
 * plain text message. The caller is responsible for handling those tool_calls
 * and continuing the conversation if needed.
 *
 * @param messages - The conversation history to send to the model.
 * @param tools - Optional tool definitions the model may choose to invoke.
 * @returns The full completion response, including any tool_calls on the first choice.
 * @throws If GITHUB_TOKEN is not set or if the API request fails.
 */
export async function callWithTools(messages: ChatMessage[], tools?: ToolDefinition[]): Promise<CompletionResponse> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error('GITHUB_TOKEN is not set');
    }

    const body: CompletionRequest = {
        model: githubModelsConfig.model,
        messages,
        ...(tools && tools.length > 0 && { tools, tool_choice: 'auto' })
    };

    const response = await fetch(`${githubModelsConfig.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`POST /chat/completions failed with status ${response.status}: ${response.statusText}`);
    }

    logTokens(response);
    return response.json() as Promise<CompletionResponse>;
}

function logTokens(response: Response) {
    const headers = response.headers;
    const remainingRequests = headers.get('x-ratelimit-remaining-requests');
    const limitRequests = headers.get('x-ratelimit-limit-requests');
    const remainingTokens = headers.get('x-ratelimit-remaining-tokens');
    const limitTokens = headers.get('x-ratelimit-limit-tokens');
    console.log(
        `[GitHub Models] requests: ${remainingRequests}/${limitRequests} remaining` +
            ` | tokens: ${remainingTokens}/${limitTokens} remaining`
    );
}
