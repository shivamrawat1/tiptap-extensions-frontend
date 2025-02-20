import React from 'react';
import { Editor } from '@tiptap/core';

interface CommandMenuProps {
    editor: Editor;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    style?: React.CSSProperties;
}

interface CommandOption {
    title: string;
    description: string;
    command: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ editor, isOpen, setIsOpen, style }) => {
    const options: CommandOption[] = [
        {
            title: 'Paragraph',
            description: 'Convert to a paragraph block',
            command: () => editor.chain().focus().setParagraph().run(),
        },
        {
            title: 'Heading 1',
            description: 'Convert to a large section heading block',
            command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
            title: 'Heading 2',
            description: 'Convert to a medium section heading block',
            command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            title: 'Heading 3',
            description: 'Convert to a small section heading block',
            command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
            title: 'Bullet List',
            description: 'Create a bulleted list',
            command: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            title: 'Numbered List',
            description: 'Create a numbered list',
            command: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            title: 'Code Block',
            description: 'Create a code block',
            command: () => editor.chain().focus().toggleCodeBlock().run(),
        },
    ];

    if (!isOpen) return null;

    return (
        <div className="command-menu" style={style}>
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => {
                        option.command();
                        setIsOpen(false);
                    }}
                    className="command-option"
                >
                    <div className="command-option-title">{option.title}</div>
                    <div className="command-option-description">{option.description}</div>
                </button>
            ))}
        </div>
    );
}; 