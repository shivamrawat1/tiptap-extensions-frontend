import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import '../../styles/components/_mcq.scss';
import { MCQAttributes } from './extensions/MCQExtension';

export const MCQComponent: React.FC<NodeViewProps> = ({
    node,
    updateAttributes,
    editor,
    deleteNode,
    getPos,
}) => {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    // Get editable state directly from editor
    const isEditable = editor?.isEditable ?? false;

    // Force update when editor state changes
    React.useEffect(() => {
        if (!editor) return;

        const handleStateChange = () => {
            forceUpdate();
        };

        editor.on('transaction', handleStateChange);
        editor.on('update', handleStateChange);

        return () => {
            editor.off('transaction', handleStateChange);
            editor.off('update', handleStateChange);
        };
    }, [editor]);

    const safeUpdateAttributes = React.useCallback((attrs: Partial<MCQAttributes>) => {
        if (isEditable && updateAttributes) {
            updateAttributes(attrs);
        }
    }, [isEditable, updateAttributes]);

    const attrs = node.attrs as MCQAttributes;

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        safeUpdateAttributes({ question: e.target.value });
    };

    const handleChoiceChange = (index: number, value: string) => {
        const newChoices = [...attrs.choices];
        newChoices[index] = value;
        safeUpdateAttributes({ choices: newChoices });
    };

    const handleCorrectAnswerChange = (index: number) => {
        safeUpdateAttributes({ correctAnswer: index });
    };

    const handleStudentSelection = (index: number) => {
        if (!isEditable) {
            safeUpdateAttributes({ selectedAnswer: index });
        }
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

    return (
        <NodeViewWrapper className="mcq-container">
            {isEditable ? (
                <div className="mcq-edit-mode">
                    <div className="mcq-header">
                        <input
                            type="text"
                            value={attrs.question}
                            onChange={handleQuestionChange}
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
                                    type="text"
                                    value={choice}
                                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                />
                                <input
                                    type="radio"
                                    name={`correctAnswer-${attrs.id}`}
                                    checked={attrs.correctAnswer === index}
                                    onChange={() => handleCorrectAnswerChange(index)}
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
                                className={`mcq-choice ${attrs.selectedAnswer === index ? 'selected' : ''}
                                    ${attrs.selectedAnswer !== null &&
                                        attrs.correctAnswer === index ? 'correct' : ''}
                                    ${attrs.selectedAnswer === index &&
                                        attrs.selectedAnswer !== attrs.correctAnswer ? 'incorrect' : ''
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`mcq-answer-${attrs.id}`}
                                    checked={attrs.selectedAnswer === index}
                                    onChange={() => handleStudentSelection(index)}
                                />
                                <label>{choice}</label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
}; 