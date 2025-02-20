import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { EditorBubbleMenu } from "./BubbleMenu";
import { EditableToggle } from "./EditableToggle";
import { extensions, defaultContent } from "./config";
import '../../styles/components/_editor.scss';

export const Editor: React.FC = () => {
    // Add state for tracking editable status
    const [isEditable, setIsEditable] = useState(true);

    const editor = useEditor({
        extensions,
        content: defaultContent,
        editable: isEditable, // Use the state variable here
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
            },
        },
    });

    // Toggle function for the editable state
    const toggleEditable = () => {
        setIsEditable(!isEditable);
        // We also need to update the editor's editable state directly
        editor?.setEditable(!isEditable);
    };

    return (
        <div>
            <div className="toggle-container">
                <span className="header-text">TIPTAP</span>
                <EditableToggle
                    isEditable={isEditable}
                    onToggle={toggleEditable}
                />
            </div>
            <div className="editor-wrapper">
                {editor && <EditorBubbleMenu editor={editor} />}
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default Editor; 
