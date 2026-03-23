import { useState } from 'react';
import './App.css';
import { Field, FieldLabel } from './components/ui/field';
import { Progress } from './components/ui/progress';
import { Dropzone } from './components/ui/dropzone';
import { useSummarize } from './hooks/useSummarize';

function App() {
    const [file, setFile] = useState<File | null>(null);
    const { data: sections, isFetching, error } = useSummarize(file);
    const sectionCount = sections?.length ?? 0;

    return (
        <main className='flex flex-col items-center w-full min-h-screen p-8 gap-6'>
            <section className='flex flex-col w-full max-w-lg gap-4'>
                <h1 className='text-2xl text-primary font-bold '>Scientific Article Summarizer</h1>
                <p className='text-sm text-muted-foreground'>
                    Upload a scientific article PDF and get concise, section by section summaries. Key findings,
                    methods, and conclusions are extracted automatically.
                </p>
                {error && (
                    <p role='alert' className='font-semibold text-sm text-destructive animate-in fade-in duration-500'>
                        An error occurred while summarizing this article. This service may be offline or rate-limited.
                        Try again in a few minutes.
                    </p>
                )}
                <Field>
                    <FieldLabel>Upload a PDF</FieldLabel>
                    <Dropzone file={file} disabled={isFetching} accept='application/pdf' onChange={setFile} />
                </Field>
            </section>

            {sections && sections.length > 0 && (
                <section className='flex flex-col gap-6 w-full max-w-lg'>
                    {sections.map((s) => (
                        <article key={s.title} className='flex flex-col animate-in fade-in duration-500 gap-2'>
                            <h2 className='text-xl text-primary font-bold'>{s.title}</h2>
                            <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2'>
                                {s.summary
                                    .split('\n')
                                    .filter(Boolean)
                                    .map((point) => (
                                        <li key={point}>{point}</li>
                                    ))}
                            </ul>
                        </article>
                    ))}
                </section>
            )}

            {isFetching && (
                <section className='flex flex-col gap-2 w-full max-w-lg'>
                    <p className='text-sm text-muted-foreground'>Summarizing section {sectionCount + 1} of 6</p>
                    <Progress value={(sectionCount / 6) * 100} />
                </section>
            )}
        </main>
    );
}

export default App;
