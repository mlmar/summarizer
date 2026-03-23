import type { Application } from 'express';
import { summarizeRouter } from './summarize.ts';

/**
 * Mounts all application routers onto the given Express app instance.
 *
 * Routes registered:
 * - `POST /summarize` - PDF upload and section summarization.
 * - `GET /ping` - pong
 *
 * @param app - The Express application instance.
 */
export function registerRoutes(app: Application): void {
    app.use('/summarize', summarizeRouter);

    app.get('/ping', (req, res) => {
        res.json('pong');
    });
}
