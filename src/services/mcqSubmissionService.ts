import axios from 'axios';

// Define interfaces for the submission data
interface MCQSubmission {
    mcqId: string;
    selectedAnswer: string;
    correctAnswer: string;
    username: string;
}

interface MCQSubmissionResponse {
    success: boolean;
    message: string;
    submissionId?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export const submitMCQAnswer = async (submissionData: MCQSubmission): Promise<MCQSubmissionResponse> => {
    try {
        const response = await axios.post<MCQSubmissionResponse>(
            `${API_BASE_URL}/api/mcq/submit`,
            submissionData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return {
            success: true,
            message: 'Successfully submitted answer',
            submissionId: response.data.submissionId
        };
    } catch (error) {
        // Improved error handling
        if (axios.isAxiosError(error)) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to submit MCQ answer'
            };
        }
        return {
            success: false,
            message: 'An unexpected error occurred'
        };
    }
};

// Helper function with default username
export const submitMCQAnswerWithDefaultUser = async (
    mcqId: string,
    selectedAnswer: string,
    correctAnswer: string,
): Promise<MCQSubmissionResponse> => {
    try {
        // Add validation
        if (!mcqId || selectedAnswer === undefined || correctAnswer === undefined) {
            return {
                success: false,
                message: 'Missing required submission data'
            };
        }

        const defaultUsername = 'abc';

        const response = await submitMCQAnswer({
            mcqId,
            selectedAnswer,
            correctAnswer,
            username: defaultUsername,
        });

        // If the API is not available, simulate success for testing
        if (!response.success && process.env.NODE_ENV === 'development') {
            console.warn('API not available, simulating successful submission');
            return {
                success: true,
                message: 'Simulated successful submission',
                submissionId: 'simulated-' + Date.now()
            };
        }

        return response;
    } catch (error) {
        console.error('Error in submitMCQAnswerWithDefaultUser:', error);
        return {
            success: false,
            message: 'Failed to process submission'
        };
    }
}; 