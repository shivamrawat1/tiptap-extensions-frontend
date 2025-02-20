import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import '../../styles/components/_mcq.scss';
import { MCQAttributes } from './extensions/MCQExtension';

export const MCQComponent: React.FC<NodeViewProps> = ({
    node,
    updateAttributes,
    editor,
    deleteNode,
}) => {
    const isEditable = editor.isEditable;
    const attrs = node.attrs as MCQAttributes;

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateAttributes({ question: e.target.value });
    };

    const handleChoiceChange = (index: number, value: string) => {
        const newChoices = [...attrs.choices];
        newChoices[index] = value;
        updateAttributes({ choices: newChoices });
    };

    const handleCorrectAnswerChange = (index: number) => {
        updateAttributes({ correctAnswer: index });
    };

    const handleStudentSelection = (index: number) => {
        updateAttributes({ selectedAnswer: index });
    };

    const addOption = () => {
        const newChoices = [...attrs.choices, `Option ${attrs.choices.length + 1}`];
        updateAttributes({ choices: newChoices });
    };

    const removeOption = (index: number) => {
        if (attrs.choices.length <= 2) return; // Minimum 2 options
        const newChoices = attrs.choices.filter((_, i) => i !== index);

        // Handle the correctAnswer update with null check
        let newCorrectAnswer = attrs.correctAnswer;
        if (attrs.correctAnswer !== null) {
            if (attrs.correctAnswer === index) {
                newCorrectAnswer = null;
            } else if (attrs.correctAnswer > index) {
                newCorrectAnswer = attrs.correctAnswer - 1;
            }
        }

        updateAttributes({
            choices: newChoices,
            correctAnswer: newCorrectAnswer
        });
    };

    const handleDelete = () => {
        deleteNode();
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
                                className={`mcq-choice ${attrs.selectedAnswer === index ? 'selected' : ''
                                    } ${attrs.selectedAnswer !== null &&
                                        attrs.correctAnswer === index ? 'correct' : ''
                                    } ${attrs.selectedAnswer === index &&
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