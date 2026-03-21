import { Router } from 'express';
import multer from 'multer';
import { validatePdfUpload } from '../middleware/validate.ts';
import { extractText } from '../services/pdfExtractor.ts';
import { summarizeArticle } from '../services/sectionSummarizer.ts';

const upload = multer({ storage: multer.memoryStorage() });

export const summarizeRouter = Router();

summarizeRouter.post('/', upload.single('file'), validatePdfUpload, async (req, res) => {
    const text = await extractText(req.file!.buffer);
    const result = await summarizeArticle(text);
    res.json(result);
});
