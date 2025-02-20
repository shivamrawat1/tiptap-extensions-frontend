import axios from 'axios';

interface PythonExecutionRequest {
    code: string;
}

interface PythonExecutionResponse {
    success: boolean;
    output?: string;
    error?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export const executePythonCode = async (code: string): Promise<PythonExecutionResponse> => {
    try {
        const response = await axios.post<PythonExecutionResponse>(
            `${API_BASE_URL}/api/python/execute`,
            { code } as PythonExecutionRequest,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to execute Python code',
            };
        }
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}; 