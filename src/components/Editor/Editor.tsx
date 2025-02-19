import React, { useEffect } from 'react';
import { useEditor, EditorContent, NodeViewContent, Editor as TiptapEditor } from '@tiptap/react';
import MenuBar from './MenuBar';
import { extensions as baseExtensions, defaultContent } from "./config";
import { MCQExtension } from './MCQExtension';

interface EditorProps {
    isEditable: boolean;
}

// Define proper types for nodeViews
type NodeViewProps = {
    node: any;
    view: any;
    getPos: () => number;
    decorations: any[];
}

export const Editor: React.FC<EditorProps> = ({ isEditable }) => {
    const editor = useEditor({
        extensions: [
            ...baseExtensions.filter(ext => ext.name !== 'mcq'),
            MCQExtension.configure({
                isEditable
            })
        ],
        content: defaultContent,
        editable: isEditable,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
            },
        }
    });

    // Update editor's editable state when isEditable prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(isEditable);
            editor.view.updateState(editor.view.state);
        }
    }, [isEditable, editor]);

    return (
        <div className="editor">
            {isEditable && (
                <div className="editor-menu-bar">
                    <MenuBar isEditable={isEditable} editor={editor} />
                </div>
            )}
            <EditorContent editor={editor} />
        </div>
    );
};

export default Editor; 