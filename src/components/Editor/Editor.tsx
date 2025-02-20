import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { EditorBubbleMenu } from "./BubbleMenu";
import { extensions, defaultContent } from "./config";
import '../../styles/components/bubblebar.scss';

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
        <div className="editor-wrapper">
            {/* Add toggle button */}
            <button
                onClick={toggleEditable}
                className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                {isEditable ? 'Disable Editing' : 'Enable Editing'}
            </button>

            {editor && <EditorBubbleMenu editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
};

export default Editor; 
