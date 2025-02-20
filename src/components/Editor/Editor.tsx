import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { EditorBubbleMenu } from "./BubbleMenu";
import { extensions, defaultContent } from "./config";
import '../../styles/components/bubblebar.scss';

export const Editor: React.FC = () => {
    const editor = useEditor({
        extensions,
        content: defaultContent,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
            },
        },
    });

    return (
        <div className="editor-wrapper">
            {editor && <EditorBubbleMenu editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
};

export default Editor; 
