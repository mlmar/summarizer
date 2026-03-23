import { useState, type FormEvent } from 'react';
import './App.css';
import { postForm } from '@summarizer/common/http.ts';
import type { SummarizeResponse } from '@summarizer/common/index.ts';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Input } from './components/ui/input';
import { Field, FieldDescription, FieldLabel } from './components/ui/field';

const SUMMARIZE_URL = 'http://localhost:3300/summarize';

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<SummarizeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await postForm<SummarizeResponse>(SUMMARIZE_URL, formData);
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className='flex flex-col items-center w-full min-h-screen p-8 gap-6'>
            <Card className='w-full max-w-lg'>
                <CardHeader>
                    <CardTitle>PDF Summarizer</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                        <Field>
                            <FieldLabel htmlFor='input-demo-api-key'>Upload a file </FieldLabel>
                            <Input
                                type='file'
                                accept='application/pdf'
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                            <FieldDescription>Upload an Article</FieldDescription>
                        </Field>
                        <Button type='submit' disabled={!file || loading}>
                            {loading ? 'Summarizing…' : 'Summarize'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                <Alert variant='destructive' className='w-full max-w-lg'>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {result && (
                <div className='flex flex-col gap-4 w-full max-w-lg'>
                    {result.sections.map((s, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className='text-base'>{s.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-sm text-muted-foreground'>{s.summary}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}

export default App;
