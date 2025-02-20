import React, { useState, useReducer, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import MonacoEditor from '@monaco-editor/react';
import { executePythonCode } from '../../services/pythonExecutionService';
import '../../styles/components/_codeblock.scss';

interface TestCase {
    input: string;
    expectedOutput: string;
}

interface TestResult {
    passed: boolean;
    actual: string;
    expected: string;
}

interface CodeBlockAttributes {
    language: string;
    code: string;
    template?: string;
    question: string;
    testCases: TestCase[];
    testResults: TestResult[] | null;
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
    const [testResults, setTestResults] = useState<TestResult[] | null>(null);

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

    const handleAddTestCase = () => {
        const currentTestCases = [...(attrs.testCases || [])];
        currentTestCases.push({ input: '', expectedOutput: '' });
        updateAttributes({ testCases: currentTestCases });
    };

    const handleTestCaseChange = (index: number, field: 'expectedOutput', value: string) => {
        const currentTestCases = [...(attrs.testCases || [])];
        currentTestCases[index] = {
            ...currentTestCases[index],
            [field]: value
        };
        updateAttributes({ testCases: currentTestCases });
    };

    const handleRemoveTestCase = (index: number) => {
        const currentTestCases = [...(attrs.testCases || [])];
        currentTestCases.splice(index, 1);
        updateAttributes({ testCases: currentTestCases });
    };

    const runCode = async () => {
        setIsRunning(true);
        setError(null);
        setTestResults(null); // Clear previous test results when running code

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

    const handleSubmit = async () => {
        setIsRunning(true);
        setError(null);
        const results: TestResult[] = [];

        try {
            // Execute the code once
            const response = await executePythonCode(attrs.code);

            if (!response.success) {
                setError(response.error || 'Execution failed');
                return;
            }

            // Split the output into lines and trim each line
            const outputLines = (response.output || '')
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0); // Remove empty lines

            // Compare each line with corresponding test case
            attrs.testCases.forEach((testCase, index) => {
                const expected = testCase.expectedOutput.trim();
                const actual = outputLines[index] || ''; // Get corresponding line or empty string if no output

                results.push({
                    passed: actual === expected,
                    actual,
                    expected
                });
            });

            // Check if we have enough output lines for all test cases
            if (outputLines.length < attrs.testCases.length) {
                setError(`Not enough output lines. Expected ${attrs.testCases.length} lines but got ${outputLines.length}`);
            } else if (outputLines.length > attrs.testCases.length) {
                setError(`Too many output lines. Expected ${attrs.testCases.length} lines but got ${outputLines.length}`);
            }

            setTestResults(results);
            const passedCount = results.filter(r => r.passed).length;
            setOutput(`Passed ${passedCount}/${results.length} test cases`);
        } catch (err) {
            setError('Failed to execute test cases. Please try again.');
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
                    <>
                        <textarea
                            className="question-input"
                            value={attrs.question || ''}
                            onChange={handleQuestionChange}
                            placeholder="Enter your question here..."
                        />
                        <div className="test-cases-section">
                            <h4>Test Cases</h4>
                            {(attrs.testCases || []).map((testCase, index) => (
                                <div key={index} className="test-case">
                                    <textarea
                                        placeholder="Expected Output"
                                        value={testCase.expectedOutput}
                                        onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                                    />
                                    <button onClick={() => handleRemoveTestCase(index)}>Remove</button>
                                </div>
                            ))}
                            <button onClick={handleAddTestCase}>Add Test Case</button>
                        </div>
                    </>
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
                            <button
                                className="submit-button"
                                onClick={handleSubmit}
                                disabled={isRunning || !(attrs.testCases || []).length}
                            >
                                Submit
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

            {testResults && (
                <div className="test-results-section">
                    <h4>Test Results</h4>
                    <div className="test-cases-results">
                        {testResults.map((result, index) => (
                            <div key={index} className={`test-case-result ${result.passed ? 'passed' : 'failed'}`}>
                                <div>Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}</div>
                                {!result.passed && (
                                    <div className="result-details">
                                        <div>Expected: {result.expected}</div>
                                        <div>Actual: {result.actual}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
}; 