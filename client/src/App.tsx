import { useState } from 'react';
import './App.css';
import { Progress } from './components/ui/progress';
import { Dropzone } from './components/ui/dropzone';
import { useSummarize } from './hooks/useSummarize';
import { SectionSummary } from './components/SectionSummary';
import { Spinner } from '@/components/ui/spinner';

const TOTAL_SECTIONS = 6;

function App() {
    const [file, setFile] = useState<File | null>(null);
    const { data: sections, isFetching, error } = useSummarize(file);
    const sectionCount = sections?.length ?? 0;

    return (
        <main className='flex flex-col items-center w-full h-full p-4 gap-6'>
            <section className='flex flex-col w-full max-w-xl gap-4'>
                <h1 className='text-2xl font-bold '>Scientific Article Summarizer</h1>
                <p className='text-sm text-muted-foreground'>
                    Upload a PDF and get concise, section by section summaries. Key findings, methods, and conclusions
                    are extracted automatically.
                </p>
                <Dropzone file={file} disabled={isFetching} accept='application/pdf' onChange={setFile} />
                {error && (
                    <p role='alert' className='font-semibold text-sm text-destructive animate-in fade-in duration-500'>
                        An error occurred while summarizing this article. This service may be offline or rate-limited.
                        Try again in a few minutes.
                    </p>
                )}
            </section>

            {isFetching && (
                <section className='flex flex-col gap-2 w-full max-w-xl'>
                    <h2 className='flex items-center text-sm text-muted-foreground gap-2'>
                        Summarizing section {sectionCount + 1} of {TOTAL_SECTIONS} <Spinner />
                    </h2>
                    <Progress value={(sectionCount / TOTAL_SECTIONS) * 100} />
                </section>
            )}

            {sections && sections.length > 0 && (
                <section className='flex flex-col gap-6 w-full max-w-xl pb-2'>
                    {sections.map((s) => (
                        <SectionSummary key={s.title} title={s.title} summary={s.summary} />
                    ))}
                </section>
            )}
        </main>
    );
}

export default App;
