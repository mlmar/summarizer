import { app } from './app.ts';

const PORT = Number(process.env.PORT ?? 3300);
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
