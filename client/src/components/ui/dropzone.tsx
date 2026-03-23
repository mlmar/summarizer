import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropzoneProps {
    file: File | null;
    disabled?: boolean;
    onChange: (file: File) => void;
    accept?: string;
    placeholder?: string;
    dragLabel?: string;
}

/**
 * Dropzone component for file uploads
 */
export function Dropzone({
    file,
    disabled,
    onChange,
    accept,
    placeholder = 'Drop a file here or click to browse',
    dragLabel = 'Drop to upload'
}: DropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const label = isDragging ? dragLabel : placeholder;

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped && (!accept || accept.split(',').some((t) => dropped.type === t.trim()))) {
            onChange(dropped);
        }
    }

    return (
        <>
            <div
                role='button'
                tabIndex={disabled ? -1 : 0}
                aria-label={`Upload ${accept} - click or drop a file here`}
                onClick={() => !disabled && inputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled) setIsDragging(true);
                }}
                onDragEnter={(e) => {
                    e.preventDefault();
                    if (!disabled) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={disabled ? undefined : handleDrop}
                className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer select-none',
                    {
                        'pointer-events-none opacity-50': disabled,
                        'hover:border-ring hover:border-primary hover:bg-accent/40': !disabled
                    },
                    {
                        'border-ring border-primary bg-accent/60': isDragging,
                        'border-input': !isDragging
                    }
                )}
            >
                <UploadCloud className='size-8 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>{file ? file.name : label}</span>
            </div>
            <input
                ref={inputRef}
                type='file'
                accept={accept}
                className='sr-only'
                disabled={disabled}
                onChange={(e) => {
                    if (e.target.files?.length) {
                        onChange(e.target.files[0]);
                    }
                }}
            />
        </>
    );
}
