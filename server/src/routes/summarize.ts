import { Router } from 'express';
import multer from 'multer';
import { validatePdfUpload } from '../middleware/validate.ts';
import { extractText } from '../services/pdfExtractor.ts';
import { streamArticleSections } from '../services/sectionSummarizer.ts';

const upload = multer({ storage: multer.memoryStorage() });

export const summarizeRouter = Router();

/**
 *  Stream responses back to client
 */
summarizeRouter.post('/', upload.single('file'), validatePdfUpload, async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const text = await extractText(req.file!.buffer);
    for await (const section of streamArticleSections(text)) {
        res.write(`data: ${JSON.stringify(section)}\n\n`);
    }
    res.end();
});
