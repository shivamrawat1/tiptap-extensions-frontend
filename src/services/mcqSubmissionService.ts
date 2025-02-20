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
        const response = await axios.post(
            `${API_BASE_URL}/api/mcq/submit`,
            submissionData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to submit MCQ answer');
        }
        throw error;
    }
};

// Helper function with default username
export const submitMCQAnswerWithDefaultUser = async (
    mcqId: string,
    selectedAnswer: string,
    correctAnswer: string,
): Promise<MCQSubmissionResponse> => {
    const defaultUsername = 'abc'; // You can modify this as needed

    return submitMCQAnswer({
        mcqId,
        selectedAnswer,
        correctAnswer,
        username: defaultUsername,
    });
}; 