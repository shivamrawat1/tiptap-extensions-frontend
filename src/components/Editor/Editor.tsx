import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import MenuBar from './MenuBar';
import { extensions, defaultContent } from "./config";

interface EditorProps {
    isEditable: boolean;
}

export const Editor: React.FC<EditorProps> = ({ isEditable }) => {
    const editor = useEditor({
        extensions: extensions,
        content: defaultContent,
        editable: isEditable,
    });

    // Update editor's editable state when isEditable prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(isEditable);
        }
    }, [isEditable, editor]);

    return (
        <div className="editor">
            <div className="editor-menu-bar">
                <MenuBar isEditable={isEditable} editor={editor} />
            </div>
            <EditorContent editor={editor} />
        </div>
    );
};

export default Editor; 