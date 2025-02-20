import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import '../../styles/components/_mcq.scss';
import { MCQAttributes } from './extensions/MCQExtension';
import { submitMCQAnswerWithDefaultUser } from '../../services/mcqSubmissionService';

export const MCQComponent: React.FC<NodeViewProps> = ({
    node,
    updateAttributes,
    editor,
    deleteNode,
    getPos,
}) => {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    // Track editor's editable state
    const [isEditable, setIsEditable] = React.useState(editor?.isEditable ?? false);

    // Add new state to track submission status
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    // Listen to editor state changes for instant view/edit switching
    React.useEffect(() => {
        if (!editor) return;

        const handleStateChange = () => {
            setIsEditable(editor.isEditable);
            forceUpdate();
        };

        // Listen to both transaction and update events
        editor.on('transaction', handleStateChange);
        editor.on('update', handleStateChange);

        // Initial state sync
        handleStateChange();

        return () => {
            editor.off('transaction', handleStateChange);
            editor.off('update', handleStateChange);
        };
    }, [editor]);

    // Allow all updates that have updateAttributes
    const safeUpdateAttributes = React.useCallback((attrs: Partial<MCQAttributes>) => {
        if (updateAttributes) {
            updateAttributes(attrs);
            forceUpdate();
        }
    }, [updateAttributes]);

    const attrs = node.attrs as MCQAttributes;

    // Clear input handlers
    const handleQuestionFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === 'Enter your question here') {
            safeUpdateAttributes({ question: '' });
        }
    };

    const handleOptionFocus = (index: number, value: string) => {
        if (value.startsWith('Option ')) {
            const newChoices = [...attrs.choices];
            newChoices[index] = '';
            safeUpdateAttributes({ choices: newChoices });
        }
    };

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isEditable) {
            safeUpdateAttributes({ question: e.target.value });
        }
    };

    const handleChoiceChange = (index: number, value: string) => {
        if (isEditable) {
            const newChoices = [...attrs.choices];
            newChoices[index] = value;
            safeUpdateAttributes({ choices: newChoices });
        }
    };

    const handleCorrectAnswerChange = (index: number) => {
        if (isEditable) {
            safeUpdateAttributes({ correctAnswer: index });
        }
    };

    const handleStudentSelection = (index: number) => {
        safeUpdateAttributes({ selectedAnswer: index });
    };

    const addOption = () => {
        if (!isEditable) return;
        const newChoices = [...attrs.choices, `Option ${attrs.choices.length + 1}`];
        safeUpdateAttributes({ choices: newChoices });
    };

    const removeOption = (index: number) => {
        if (!isEditable || attrs.choices.length <= 2) return;

        const newChoices = attrs.choices.filter((_, i) => i !== index);
        let newCorrectAnswer = attrs.correctAnswer;

        if (attrs.correctAnswer !== null) {
            if (attrs.correctAnswer === index) {
                newCorrectAnswer = null;
            } else if (attrs.correctAnswer > index) {
                newCorrectAnswer = attrs.correctAnswer - 1;
            }
        }

        safeUpdateAttributes({
            choices: newChoices,
            correctAnswer: newCorrectAnswer
        });
    };

    const handleDelete = () => {
        if (isEditable && deleteNode) {
            deleteNode();
        }
    };

    const handleClearAnswer = () => {
        safeUpdateAttributes({ selectedAnswer: null });
        setIsSubmitted(false); // Reset submission state when clearing
    };

    const handleSubmit = async () => {
        if (attrs.selectedAnswer === null) {
            console.error('Please select an answer');
            return;
        }

        try {
            const selectedAnswerText = attrs.choices[attrs.selectedAnswer];
            const correctAnswerText = attrs.correctAnswer !== null ? attrs.choices[attrs.correctAnswer] : '';

            const response = await submitMCQAnswerWithDefaultUser(
                attrs.id,
                selectedAnswerText,
                correctAnswerText
            );

            if (response.success) {
                console.log('Submission successful');
                setIsSubmitted(true); // Set submitted state to true on success
            } else {
                console.error('Submission failed: ' + response.message);
            }
        } catch (error) {
            console.error('Error submitting answer: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    return (
        <NodeViewWrapper className="mcq-container">
            {isEditable ? (
                <div className="mcq-edit-mode">
                    <div className="mcq-header">
                        <input
                            type="text"
                            value={attrs.question}
                            onChange={handleQuestionChange}
                            onFocus={handleQuestionFocus}
                            placeholder="Enter your question"
                            className="mcq-question-input"
                        />
                        <button
                            className="mcq-delete-btn"
                            onClick={handleDelete}
                            title="Delete MCQ"
                        >
                            ×
                        </button>
                    </div>
                    <div className="mcq-choices">
                        {attrs.choices.map((choice: string, index: number) => (
                            <div key={index} className="mcq-choice-edit">
                                <input
                                    type="radio"
                                    name={`correctAnswer-${attrs.id}`}
                                    checked={attrs.correctAnswer === index}
                                    onChange={() => handleCorrectAnswerChange(index)}
                                />
                                <input
                                    type="text"
                                    value={choice}
                                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                                    onFocus={() => handleOptionFocus(index, choice)}
                                    placeholder={`Option ${index + 1}`}
                                />
                                <label>Correct</label>
                                <button
                                    className="mcq-remove-option-btn"
                                    onClick={() => removeOption(index)}
                                    disabled={attrs.choices.length <= 2}
                                >
                                    −
                                </button>
                            </div>
                        ))}
                        <button
                            className="mcq-add-option-btn"
                            onClick={addOption}
                        >
                            + Add Option
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mcq-view-mode">
                    <div className="mcq-question">{attrs.question}</div>
                    <div className="mcq-choices">
                        {attrs.choices.map((choice: string, index: number) => (
                            <div
                                key={index}
                                className={`mcq-choice ${attrs.selectedAnswer === index ? 'selected' : ''}`}
                                onClick={() => handleStudentSelection(index)}
                                role="button"
                                tabIndex={0}
                            >
                                <label>{choice}</label>
                            </div>
                        ))}
                    </div>
                    <div className="mcq-actions">
                        <button
                            className="mcq-action-btn clear-btn"
                            onClick={handleClearAnswer}
                            disabled={attrs.selectedAnswer === null}
                        >
                            Clear
                        </button>
                        <button
                            className={`mcq-action-btn submit-btn ${isSubmitted ? 'submitted' : ''}`}
                            onClick={handleSubmit}
                            disabled={attrs.selectedAnswer === null || isSubmitted}
                        >
                            {isSubmitted ? 'Submitted' : 'Submit →'}
                        </button>
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
}; 