import { useState } from 'react';
import './App.css';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertTitle } from './components/ui/alert';
import { Field, FieldLabel } from './components/ui/field';
import { Spinner } from './components/ui/spinner';
import { Dropzone } from './components/ui/dropzone';
import { useSummarize } from './hooks/useSummarize';

function App() {
    const [file, setFile] = useState<File | null>(null);
    const { data: sections, isFetching, error } = useSummarize(file);

    return (
        <main className='flex flex-col items-center w-full min-h-screen p-8 gap-6'>
            <Card className='w-full max-w-lg'>
                <CardHeader>
                    <CardTitle className='text-base'>Scientific Article Summarizer</CardTitle>
                </CardHeader>
                <CardContent>
                    <Field>
                        <FieldLabel>Upload a PDF</FieldLabel>
                        <Dropzone file={file} disabled={isFetching} accept='application/pdf' onFile={setFile} />
                    </Field>
                </CardContent>
            </Card>

            {error && (
                <Alert variant='destructive' className='w-full max-w-lg'>
                    <AlertTitle>
                        An error occurred while summarizing this article. Try again in a few minutes.
                    </AlertTitle>
                </Alert>
            )}

            {sections && sections.length > 0 && (
                <section className='flex flex-col gap-4 w-full max-w-lg'>
                    {sections.map((s) => (
                        <Card key={s.title} className='animate-in fade-in slide-in-from-bottom-2 duration-500'>
                            <CardHeader>
                                <CardTitle className='text-base'>{s.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2'>
                                    {s.summary
                                        .split('\n')
                                        .filter(Boolean)
                                        .map((point) => (
                                            <li key={point}>{point}</li>
                                        ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            )}

            {isFetching && (
                <div className='flex justify-center pt-4'>
                    <Spinner className='size-8' />
                </div>
            )}
        </main>
    );
}

export default App;
