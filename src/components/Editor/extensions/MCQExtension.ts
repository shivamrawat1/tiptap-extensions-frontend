import { Node, NodeViewProps } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MCQComponent } from '../MCQComponent';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Decoration } from '@tiptap/pm/view';
import { EditorState } from '@tiptap/pm/state';

export interface MCQOptions {
    HTMLAttributes: Record<string, any>;
}

export interface MCQAttributes {
    question: string;
    choices: string[];
    correctAnswer: number | null;
    selectedAnswer: number | null;
    id: string;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        mcq: {
            setMCQ: () => ReturnType;
            removeMCQ: (id: string) => ReturnType;
        };
    }
}

export const MCQExtension = Node.create<MCQOptions>({
    name: 'mcq',

    group: 'block',

    content: 'inline*',

    atom: true,

    addAttributes() {
        return {
            question: {
                default: 'Enter your question here',
            },
            choices: {
                default: ['Option 1', 'Option 2'],
            },
            correctAnswer: {
                default: null,
            },
            selectedAnswer: {
                default: null,
            },
            id: {
                default: () => `mcq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="mcq"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', { 'data-type': 'mcq', ...HTMLAttributes }, 0];
    },

    addCommands() {
        return {
            setMCQ:
                () =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: {
                                question: 'Enter your question here',
                                choices: ['Option 1', 'Option 2'],
                                correctAnswer: null,
                                selectedAnswer: null,
                                id: `mcq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            },
                        });
                    },
            removeMCQ:
                (id: string) =>
                    ({ commands }) => {
                        return commands.deleteNode(this.name);
                    },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(MCQComponent, {
            update: ({ newNode, oldNode }) => {
                return !oldNode.sameMarkup(newNode);
            },
        });
    },
}); 