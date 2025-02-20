import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CodeBlockComponent } from '../CodeBlockComponent';

interface TestCase {
    input: string;
    expectedOutput: string;
}

export interface CodeBlockOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        pythonCodeBlock: {
            setPythonCodeBlock: (options?: {
                template?: string;
                question?: string;
                testCases?: TestCase[];
            }) => ReturnType;
        };
    }
}

export const CodeBlockExtension = Node.create<CodeBlockOptions>({
    name: 'pythonCodeBlock',

    group: 'block',

    content: 'inline*',

    addAttributes() {
        return {
            language: {
                default: 'python',
            },
            code: {
                default: '# Write your Python code here\n',
            },
            template: {
                default: null,
            },
            question: {
                default: '',
            },
            lastExecution: {
                default: null,
                parseHTML: () => null,
                renderHTML: () => null,
            },
            testCases: {
                default: [],
            },
            testResults: {
                default: null,
                parseHTML: () => null,
                renderHTML: () => null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="python-code-block"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', { 'data-type': 'python-code-block', ...HTMLAttributes }, 0];
    },

    addCommands() {
        return {
            setPythonCodeBlock:
                (options = {}) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: {
                                language: 'python',
                                code: options.template || '# Write your Python code here\n',
                                template: options.template || null,
                                question: options.question || '',
                                testCases: options.testCases || [],
                            },
                        });
                    },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent);
    },
}); 