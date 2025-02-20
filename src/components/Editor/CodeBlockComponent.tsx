import React, { useState, useReducer, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import MonacoEditor from '@monaco-editor/react';
import { executePythonCode } from '../../services/pythonExecutionService';
import '../../styles/components/_codeblock.scss';

interface CodeBlockAttributes {
    language: string;
    code: string;
    template?: string;
    question: string;
}

export const CodeBlockComponent: React.FC<NodeViewProps> = ({
    node,
    updateAttributes,
    editor
}) => {
    const [output, setOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [savedCode, setSavedCode] = useState<string | null>(null);

    // Track editor's editable state
    const [isEditable, setIsEditable] = useState(editor?.isEditable ?? false);

    // Listen to editor state changes for instant view/edit switching
    useEffect(() => {
        if (!editor) return;

        const handleStateChange = () => {
            const newIsEditable = editor.isEditable;

            // If switching from edit to view mode, save the current code
            if (isEditable && !newIsEditable) {
                setSavedCode(node.attrs.code);
            }

            setIsEditable(newIsEditable);
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
    }, [editor, isEditable, node.attrs.code]);

    const attrs = node.attrs as CodeBlockAttributes;

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            updateAttributes({ code: value });
        }
    };

    const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (isEditable) {
            updateAttributes({ question: e.target.value });
        }
    };

    const runCode = async () => {
        setIsRunning(true);
        setError(null);

        try {
            const response = await executePythonCode(attrs.code);

            if (!response.success) {
                setError(response.error || 'Execution failed');
                setOutput('');
            } else {
                setOutput(response.output || '');
                setError(null);
            }
        } catch (err) {
            setError('Failed to execute code. Please try again.');
        } finally {
            setIsRunning(false);
        }
    };

    const handleReset = () => {
        // Reset to saved code if available, otherwise fall back to template
        updateAttributes({
            code: savedCode || attrs.template || '# Write your Python code here\n'
        });
    };

    return (
        <NodeViewWrapper className="code-block-wrapper">
            <div className="question-section">
                {isEditable ? (
                    <textarea
                        className="question-input"
                        value={attrs.question || ''}
                        onChange={handleQuestionChange}
                        placeholder="Enter your question here..."
                    />
                ) : (
                    <div className="question-display">
                        {attrs.question || 'No question provided'}
                    </div>
                )}
            </div>

            <div className="code-content-wrapper">
                <div className="code-section">
                    <div className="code-block-header">
                        <span className="language-label">Python</span>
                        <div className="button-group">
                            <button
                                className="reset-button"
                                onClick={handleReset}
                                title="Reset Code"
                            >
                                Reset
                            </button>
                            <button
                                className="run-button"
                                onClick={runCode}
                                disabled={isRunning}
                            >
                                {isRunning ? 'Running...' : 'Run Code'}
                            </button>
                        </div>
                    </div>

                    <div className="code-editor">
                        <MonacoEditor
                            height="100%"
                            language="python"
                            theme="vs-dark"
                            value={attrs.code}
                            onChange={handleEditorChange}
                            options={{
                                minimap: { enabled: false },
                                lineNumbers: 'on',
                                readOnly: false,
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>
                </div>

                <div className="output-section">
                    <div className="output-header">Output:</div>
                    <div className="output-content">
                        {error ? (
                            <pre className="error">{error}</pre>
                        ) : output ? (
                            <pre>{output}</pre>
                        ) : (
                            <div className="no-output">Run the code to see output</div>
                        )}
                    </div>
                </div>
            </div>
        </NodeViewWrapper>
    );
}; 