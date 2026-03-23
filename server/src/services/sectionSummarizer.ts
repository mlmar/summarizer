import { callWithTools } from './githubModels.ts';
import type { ChatMessage, ToolDefinition, ToolCall } from '../types/github.ts';
import type { SummarizeResponse } from '../types/api.ts';

const STAGE1_CHUNK_SIZE = 24_000;
const STAGE2_CONTENT_CAP = 20_000;

const CORE_SECTIONS = new Set([
    'abstract',
    'introduction',
    'methods',
    'materials and methods',
    'results',
    'discussion',
    'conclusion',
    'conclusions'
]);

/**
 * Splits text into chunks of at most maxSize characters, preferring to break
 * at paragraph boundaries (\n\n) to avoid splitting mid-sentence.
 */
function chunkText(text: string, maxSize: number): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split(/\n\n+/);
    let current = '';

    for (const para of paragraphs) {
        const separator = current ? '\n\n' : '';
        if (current.length + separator.length + para.length > maxSize) {
            if (current) chunks.push(current);
            // If a single paragraph exceeds maxSize, hard-split it
            if (para.length > maxSize) {
                for (let i = 0; i < para.length; i += maxSize) {
                    chunks.push(para.slice(i, i + maxSize));
                }
                current = '';
            } else {
                current = para;
            }
        } else {
            current = current + separator + para;
        }
    }

    if (current) chunks.push(current);
    return chunks;
}

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
                    description: 'The section heading (e.g. "Abstract", "Methods")'
                },
                content: {
                    type: 'string',
                    description: 'The full text of the section'
                }
            },
            required: ['title', 'content']
        }
    }
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
                'You are a scientific writing assistant. Summarize the provided section of a scientific article as 3-5 concise bullet points, preserving key findings and terminology. Return only the bullet points, one per line, with no bullet characters or prefixes.'
        },
        {
            role: 'user',
            content: `Section: ${title}\n\n${content}`
        }
    ];

    const response = await callWithTools(messages);
    return response.choices[0]?.message.content ?? '';
}

/**
 * Summarizes an entire scientific article section by section, yielding each
 * result as soon as it is ready.
 *
 * Stage 1 - section detection: the model is prompted to call the
 * `summarize_section` tool once per core section it identifies in each chunk.
 *
 * Stage 2 - per-section summarization: for every detected section, the content
 * is sent to the model and the resulting summary is yielded immediately.
 *
 * @param text - The full plain text of the scientific article.
 * @yields Each section title and its summary as soon as it is available.
 */
export async function* streamArticleSections(text: string): AsyncGenerator<SummarizeResponse['sections'][number]> {
    const chunks = chunkText(text, STAGE1_CHUNK_SIZE);

    const systemMessage: ChatMessage = {
        role: 'system',
        content:
            'You are a scientific document parser. Given the full text of a scientific article, identify only the core sections (Abstract, Introduction, Methods/Materials and Methods, Results, Discussion, and Conclusion) and call the summarize_section tool once for each. Ignore acknowledgements, references, appendices, supplementary material, and author contributions. Do not respond with any text - only make tool calls.'
    };

    // Stage 1 - run section detection on each chunk sequentially
    const allToolCalls: ToolCall[] = [];
    for (const chunk of chunks) {
        const response = await callWithTools([systemMessage, { role: 'user', content: chunk }], [summarizeSectionTool]);
        allToolCalls.push(...(response.choices[0]?.message.tool_calls ?? []));
    }

    const mergedSections = new Map<string, { title: string; content: string }>();
    for (const call of allToolCalls) {
        const args = JSON.parse(call.function.arguments) as { title: string; content: string };
        const key = args.title.toLowerCase();
        if (!CORE_SECTIONS.has(key)) { // Skip non essential sections
            continue;
        }

        const existing = mergedSections.get(key); // Merge existing sections together
        if (existing) {
            existing.content += '\n\n' + args.content;
        } else {
            mergedSections.set(key, { title: args.title, content: args.content });
        }
    }

    // Stage 2 - summarize each merged section sequentially, yielding as each completes
    for (const { title, content } of mergedSections.values()) {
        const capped = content.slice(0, STAGE2_CONTENT_CAP);
        const summary = await summarizeSection(title, capped);
        yield { title, summary };
    }
}
