import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewProps, NodeViewWrapper, Editor } from '@tiptap/react'
import React, { useState, ChangeEvent, useEffect, useCallback } from 'react'
import { FaTrash, FaPlus, FaTimes } from 'react-icons/fa' // Make sure to install react-icons
import '../../styles/components/MCQExtension.css'

interface MCQAttributes {
    question: string
    choices: string[]
    correctChoice: number
    selectedChoice: number | null
}

interface MCQOptions {
    isEditable: boolean;
}

// Correctly type the component props
interface MCQComponentProps extends Omit<NodeViewProps, 'node'> {
    node: ProseMirrorNode & {
        attrs: MCQAttributes
    }
    extension: Node & {
        options: MCQOptions;
    }
}

// Move EditMode outside of the MCQComponent
const EditMode: React.FC<{
    question: string;
    choices: string[];
    correctChoice: number;
    questionInputRef: React.RefObject<HTMLTextAreaElement | null>;
    choiceInputRefs: React.RefObject<Array<HTMLTextAreaElement | null>>;
    handleQuestionChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    handleChoiceChange: (index: number, value: string) => void;
    handleCorrectChoiceChange: (index: number) => void;
    removeChoice: (index: number) => void;
    addNewChoice: () => void;
    deleteNode: () => void;
}> = React.memo(({
    question,
    choices,
    correctChoice,
    questionInputRef,
    choiceInputRefs,
    handleQuestionChange,
    handleChoiceChange,
    handleCorrectChoiceChange,
    removeChoice,
    addNewChoice,
    deleteNode
}) => (
    <>
        <textarea
            ref={questionInputRef}
            className="mcq-question-input"
            value={question}
            onChange={handleQuestionChange}
            placeholder="Question"
            rows={3}
            style={{ width: '100%', resize: 'vertical' }}
        />

        <div className="mcq-choices-container">
            {choices.map((choice, index) => (
                <div key={index} className="mcq-choice-item">
                    <input
                        type="radio"
                        className="mcq-radio"
                        checked={correctChoice === index}
                        onChange={() => handleCorrectChoiceChange(index)}
                    />
                    <textarea
                        ref={(element: HTMLTextAreaElement | null) => {
                            choiceInputRefs.current[index] = element;
                        }}
                        className="mcq-choice-input"
                        value={choice}
                        onChange={(e) => handleChoiceChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        rows={2}
                        style={{ width: '100%', resize: 'vertical' }}
                    />
                    {choices.length > 1 && (
                        <button
                            onClick={() => removeChoice(index)}
                            className="mcq-choice-delete"
                            title="Remove option"
                        >
                            <FaTimes size={12} />
                        </button>
                    )}
                </div>
            ))}
        </div>

        <div className="mcq-controls">
            <button
                onClick={addNewChoice}
                className="mcq-add-choice"
            >
                <FaPlus size={14} />
                Add option
            </button>

            <button
                onClick={deleteNode}
                className="mcq-delete"
                title="Delete question"
            >
                <FaTrash size={16} />
            </button>
        </div>
    </>
));

// MCQ Component that will be rendered inside editor
const MCQComponent: React.FC<MCQComponentProps> = ({
    node,
    updateAttributes,
    editor,
    deleteNode,
    extension
}) => {
    const [question, setQuestion] = useState(node.attrs.question || '')
    const [choices, setChoices] = useState(node.attrs.choices || ['', ''])
    const [selectedChoice, setSelectedChoice] = useState(node.attrs.selectedChoice || null)
    const [correctChoice, setCorrectChoice] = useState(node.attrs.correctChoice || 0)

    // Get isEditable from editor's parent state
    const [isEditable, setIsEditable] = useState(editor?.isEditable ?? false);

    // Add refs for inputs
    const questionInputRef = React.useRef<HTMLTextAreaElement | null>(null);
    const choiceInputRefs = React.useRef<Array<HTMLTextAreaElement | null>>([]);

    // Debounced update function using useCallback
    const debouncedUpdate = useCallback((attrs: Partial<MCQAttributes>) => {
        if (editor?.isEditable) {
            setTimeout(() => {
                updateAttributes(attrs);
            }, 100);
        }
    }, [editor, updateAttributes]);

    const handleQuestionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setQuestion(newValue);
        debouncedUpdate({ question: newValue });
    }, [debouncedUpdate]);

    const handleChoiceChange = useCallback((index: number, value: string) => {
        setChoices(prevChoices => {
            const newChoices = [...prevChoices];
            newChoices[index] = value;
            debouncedUpdate({ choices: newChoices }); // Debounce editor update
            return newChoices;
        });
    }, [debouncedUpdate]);

    // Listen for changes in editor's editable state
    useEffect(() => {
        const handleEditableChange = () => {
            const newIsEditable = editor?.isEditable ?? false;
            setIsEditable(newIsEditable);
            console.log('Editor editable state changed:', newIsEditable);

            if (!newIsEditable) {
                setSelectedChoice(null);
                safeUpdateAttributes({ selectedChoice: null });
            }
        };

        // Initial setup
        handleEditableChange();

        // Subscribe to editor updates
        editor?.on('update', handleEditableChange);

        // Cleanup
        return () => {
            editor?.off('update', handleEditableChange);
        };
    }, [editor]);

    const safeUpdateAttributes = (attrs: Partial<MCQAttributes>) => {
        try {
            if (!editor) {
                throw new Error('Editor is not initialized');
            }
            if (editor.isEditable) {
                updateAttributes(attrs);
            }
        } catch (error) {
            console.error('Error updating attributes:', error);
            // Consider adding user feedback here
        }
    }

    const addNewChoice = () => {
        if (choices.length >= 10) { // Add maximum limit
            return; // Consider showing user feedback
        }
        const newChoices = [...choices, '']
        setChoices(newChoices)
        safeUpdateAttributes({ choices: newChoices })
    }

    const removeChoice = (index: number) => {
        if (choices.length > 1) {
            const newChoices = choices.filter((_, i) => i !== index)
            setChoices(newChoices)

            let newCorrectChoice = correctChoice
            if (correctChoice === index) {
                newCorrectChoice = 0
            } else if (correctChoice > index) {
                newCorrectChoice = correctChoice - 1
            }

            setCorrectChoice(newCorrectChoice)
            safeUpdateAttributes({
                choices: newChoices,
                correctChoice: newCorrectChoice
            })
        }
    }

    const handleCorrectChoiceChange = (index: number) => {
        setCorrectChoice(index)
        safeUpdateAttributes({ correctChoice: index })
    }

    const handleStudentSelection = (index: number) => {
        setSelectedChoice(index)
        safeUpdateAttributes({ selectedChoice: index })
    }

    const ViewMode = () => (
        <>
            <div className="mcq-question-text">{question}</div>
            <div className="mcq-choices-container">
                {choices.map((choice, index) => (
                    <div key={index} className="mcq-choice-view">
                        <input
                            type="radio"
                            className="mcq-radio"
                            checked={selectedChoice === index}
                            onChange={() => handleStudentSelection(index)}
                        />
                        <span className="mcq-choice-label">{choice}</span>
                    </div>
                ))}
            </div>
            {selectedChoice !== null && (
                <div className={`mcq-feedback ${selectedChoice === correctChoice ? 'correct' : 'incorrect'}`}>
                    {selectedChoice === correctChoice ? (
                        '✓ Correct!'
                    ) : (
                        '✗ Incorrect. Try again!'
                    )}
                </div>
            )}
        </>
    )

    return (
        <NodeViewWrapper>
            <div className={`mcq-container ${isEditable ? 'mcq-edit' : 'mcq-view'}`}>
                {isEditable ? (
                    <EditMode
                        question={question}
                        choices={choices}
                        correctChoice={correctChoice}
                        questionInputRef={questionInputRef}
                        choiceInputRefs={choiceInputRefs}
                        handleQuestionChange={handleQuestionChange}
                        handleChoiceChange={handleChoiceChange}
                        handleCorrectChoiceChange={handleCorrectChoiceChange}
                        removeChoice={removeChoice}
                        addNewChoice={addNewChoice}
                        deleteNode={deleteNode}
                    />
                ) : (
                    <ViewMode />
                )}
            </div>
        </NodeViewWrapper>
    )
}

export const MCQExtension = Node.create<MCQOptions>({
    name: 'mcq',
    group: 'block',
    atom: true,
    draggable: true,

    addOptions() {
        return {
            isEditable: true,
        }
    },

    addAttributes() {
        return {
            question: {
                default: ''
            },
            choices: {
                default: ['', '']
            },
            correctChoice: {
                default: 0
            },
            selectedChoice: {
                default: null
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="mcq"]'
            }
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'mcq' })]
    },

    addNodeView() {
        return ReactNodeViewRenderer(MCQComponent)
    }
})