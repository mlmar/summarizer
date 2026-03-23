import { useQuery, experimental_streamedQuery, type QueryFunctionContext } from '@tanstack/react-query';
import { postFormStream } from '@summarizer/common/http.ts';
import type { SectionSummary } from '@summarizer/common';

const SUMMARIZE_URL = import.meta.env.VITE_SERVER_URL + '/summarize';

export function useSummarize(file: File | null) {
    return useQuery({
        queryKey: ['summarize', file?.name, file?.lastModified] as const,
        queryFn: experimental_streamedQuery({
            streamFn: ({ signal }: QueryFunctionContext) => {
                const formData = new FormData();
                formData.append('file', file!);
                return postFormStream<SectionSummary>(SUMMARIZE_URL, formData, undefined, signal);
            }
        }),
        retry: false,
        enabled: !!file
    });
}
