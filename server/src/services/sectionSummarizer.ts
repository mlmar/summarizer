import { callWithTools } from './githubModels.ts';
import type { ChatMessage, ToolDefinition, ToolCall } from '../types/github.ts';
import type { SummarizeResponse } from '../types/api.ts';

const summarizeSectionTool: ToolDefinition = {
    type: 'function',
    function: {
        name: 'summarize_section',
        description:
            'Identify a section of a scientific article that should be summarized. Call this once for each distinct section (e.g. Abstract, Introduction, Methods, Results, Discussion, Conclusion).',
        parameters: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'The section heading (e.g. "Abstract", "Methods")',
                },
                content: {
                    type: 'string',
                    description: 'The full text of the section',
                },
            },
            required: ['title', 'content'],
        },
    },
};

/**
 * Calls the GitHub Models API to produce a 2-4 sentence summary of a single
 * article section.
 *
 * @param title - The section heading (e.g. "Methods").
 * @param content - The full text of the section.
 * @returns The model-generated summary string.
 */
async function summarizeSection(title: string, content: string): Promise<string> {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            content:
                'You are a scientific writing assistant. Summarize the provided section of a scientific article in 2-4 concise sentences, preserving key findings and terminology.',
        },
        {
            role: 'user',
            content: `Section: ${title}\n\n${content}`,
        },
    ];

    const response = await callWithTools(messages);
    return response.choices[0]?.message.content ?? '';
}

/**
 * Summarizes an entire scientific article by using GitHub Models tool calling
 * to identify sections, then summarizing each section individually.
 *
 * Stage 1 — section detection: the model is prompted to call the
 * `summarize_section` tool once per section it identifies in the article text.
 *
 * Stage 2 — per-section summarization: for every tool_call returned, the
 * section content is sent to the model with a focused summarization prompt and
 * the resulting summary is collected.
 *
 * @param text - The full plain text of the scientific article.
 * @returns An object containing an array of section titles and their summaries.
 */
export async function summarizeArticle(text: string): Promise<SummarizeResponse> {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            content:
                'You are a scientific document parser. Given the full text of a scientific article, identify each major section (Abstract, Introduction, Methods, Results, Discussion, Conclusion, etc.) and call the summarize_section tool once for each section with the section title and its corresponding text. Do not respond with any text — only make tool calls.',
        },
        {
            role: 'user',
            content: text,
        },
    ];

    const sectionResponse = await callWithTools(messages, [summarizeSectionTool]);
    const toolCalls: ToolCall[] = sectionResponse.choices[0]?.message.tool_calls ?? [];

    const sections = await Promise.all(
        toolCalls.map(async (call) => {
            const args = JSON.parse(call.function.arguments) as { title: string; content: string };
            const summary = await summarizeSection(args.title, args.content);
            return { title: args.title, summary };
        }),
    );

    return { sections };
}
