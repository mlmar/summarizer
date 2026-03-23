/**
 * Makes a GET request to the given URL and returns the parsed JSON response.
 *
 * @param url - The URL to fetch.
 * @param headers - Optional HTTP headers to include in the request.
 * @returns The parsed JSON response body typed as T.
 * @throws If the response status is not OK.
 */
export async function get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
        method: 'GET',
        headers
    });

    if (!response.ok) {
        throw new Error(`GET ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

/**
 * Makes a POST request to the given URL with a JSON-serialized body and returns the parsed JSON response.
 *
 * @param url - The URL to post to.
 * @param body - The request payload, which will be JSON-serialized.
 * @param headers - Optional additional HTTP headers. Content-Type is set to application/json by default.
 * @returns The parsed JSON response body typed as T.
 * @throws If the response status is not OK.
 */
export async function post<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        console.error(response)
        throw new Error(`POST ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

/**
 * Makes a POST request to the given URL with a FormData body and returns the parsed JSON response.
 *
 * @param url - The URL to post to.
 * @param formData - The FormData payload (e.g. for file uploads).
 * @param headers - Optional additional HTTP headers.
 * @returns The parsed JSON response body typed as T.
 * @throws If the response status is not OK.
 */
export async function postForm<T>(url: string, formData: FormData, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
    });

    if (!response.ok) {
        throw new Error(`POST ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

/**
 * Makes a POST request to the given URL with a FormData body and yields
 * each parsed JSON object from a server-sent events (SSE) response stream.
 *
 * @param url - The URL to post to.
 * @param formData - The FormData payload (e.g. for file uploads).
 * @param headers - Optional additional HTTP headers.
 * @param signal - Optional AbortSignal to cancel the request.
 * @yields Each parsed JSON object from the SSE stream.
 * @throws If the response status is not OK.
 */
export async function* postFormStream<T>(
    url: string,
    formData: FormData,
    headers?: Record<string, string>,
    signal?: AbortSignal
): AsyncGenerator<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal
    });

    if (!response.ok) {
        throw new Error(`POST ${url} failed with status ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n\n');
            buffer = events.pop()!;

            for (const event of events) {
                const line = event.trim();
                if (!line.startsWith('data:')) continue;
                yield JSON.parse(line.slice('data:'.length).trim()) as T;
            }
        }
    } finally {
        reader.releaseLock();
    }
}
