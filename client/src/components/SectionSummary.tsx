import { useState } from 'react';
import { Button } from './ui/button';
import { Clipboard, Check } from 'lucide-react';

interface SectionSummaryProps {
    title: string;
    summary: string;
}

export function SectionSummary({ title, summary }: SectionSummaryProps) {
    const [copied, setCopied] = useState(false);

    function copyToClipboard() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(summary).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    }

    return (
        <article className='flex flex-col animate-in fade-in duration-500 gap-2'>
            <span className='flex items-center gap-2'>
                <h2 className='text-xl text-primary font-bold'>{title}</h2>
                <Button
                    className='cursor-pointer'
                    variant='ghost'
                    size='icon-sm'
                    aria-label={`Copy ${title} summary to clipboard`}
                    onClick={copyToClipboard}
                >
                    {copied ? <Check className='text-green-500 animate-in fade-in duration-500' /> : <Clipboard />}
                </Button>
            </span>
            <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2'>
                {summary
                    .split('\n')
                    .filter(Boolean)
                    .map((point) => (
                        <li key={point}>{point}</li>
                    ))}
            </ul>
        </article>
    );
}
