import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { TextItem } from 'pdfjs-dist/types/src/display/api.js';

/**
 * Extracts all plain text from a PDF file buffer.
 *
 * Iterates over every page of the document, concatenates the text items from
 * each page's text content, and joins pages with newlines.
 *
 * @param buffer - The raw bytes of a PDF file.
 * @returns A single string containing the concatenated text of all pages.
 * @throws If pdfjs-dist fails to parse the buffer as a valid PDF.
 */
export async function extractText(buffer: Buffer): Promise<string> {
    const data = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => ((item as TextItem)?.str ?? '')).join(' ');
        pageTexts.push(pageText.trim());
    }

    return pageTexts.join('\n');
}
