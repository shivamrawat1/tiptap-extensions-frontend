import axios from 'axios';

interface HintGenerationRequest {
    templateCode: string;
    currentCode: string;
    question: string;
}

interface HintGenerationResponse {
    success: boolean;
    hint?: string;
    error?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

// Improved debounce utility that returns a Promise
const debounce = <T>(fn: (...args: any[]) => Promise<T>, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: any[]): Promise<T> => {
        return new Promise((resolve) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
                const result = await fn(...args);
                resolve(result);
            }, ms);
        });
    };
};

export const generateHint = async (
    templateCode: string,
    currentCode: string,
    question: string
): Promise<HintGenerationResponse> => {
    try {
        const makeRequest = async () => {
            const response = await axios.post<HintGenerationResponse>(
                `${API_BASE_URL}/api/hint/generate`,
                {
                    templateCode,
                    currentCode,
                    question,
                } as HintGenerationRequest,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        };

        // Create debounced version of the request
        const debouncedRequest = debounce(makeRequest);
        return await debouncedRequest();
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to generate hint',
            };
        }
        return {
            success: false,
            error: 'An unexpected error occurred while generating hint',
        };
    }
}; 