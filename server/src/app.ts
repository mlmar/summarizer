import cors from 'cors';
import express from 'express';
import { registerRoutes } from './routes/index.ts';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

registerRoutes(app);

export { app };
