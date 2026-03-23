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
