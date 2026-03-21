export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_call_id?: string;
}

export interface ToolFunction {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, { type: string; description: string }>;
        required: string[];
    };
}

export interface ToolDefinition {
    type: 'function';
    function: ToolFunction;
}

export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

export interface CompletionChoice {
    message: {
        role: string;
        content: string | null;
        tool_calls?: ToolCall[];
    };
    finish_reason: string;
}

export interface CompletionRequest {
    model: string;
    messages: ChatMessage[];
    tools?: ToolDefinition[];
    tool_choice?: 'auto' | 'none';
    max_tokens?: number;
}

export interface CompletionResponse {
    choices: CompletionChoice[];
}
