import type { Request, Response, NextFunction } from 'express';

/**
 * Express middleware that validates a multipart file upload is present and is a PDF.
 *
 * Responds with HTTP 400 if:
 * - No file was attached to the request (`req.file` is undefined).
 * - The attached file's MIME type is not `application/pdf`.
 *
 * Calls `next()` to pass control to the next handler when validation passes.
 */
export function validatePdfUpload(req: Request, res: Response, next: NextFunction): void {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded.' });
        return;
    }

    if (req.file.mimetype !== 'application/pdf') {
        res.status(400).json({ error: 'Uploaded file must be a PDF.' });
        return;
    }

    next();
}
