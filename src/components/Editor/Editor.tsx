import React, { useState, useRef, useCallback, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { EditorBubbleMenu } from "./BubbleMenu";
import { EditableToggle } from "./EditableToggle";
import { extensions, defaultContent } from "./config";
import '../../styles/components/_editor.scss';
import { Node } from '@tiptap/pm/model';

export const Editor: React.FC = () => {
    const [isEditable, setIsEditable] = useState(true);
    const prevEditableRef = useRef(isEditable);

    const editor = useEditor({
        extensions,
        content: defaultContent,
        editable: isEditable,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
            },
        },
    });

    // Handle editable state changes
    const toggleEditable = useCallback(() => {
        if (!editor) return;

        const newState = !isEditable;
        // First update the editor state
        editor.setEditable(newState);
        // Then update our local state
        setIsEditable(newState);

        // Force editor to update all node views
        editor.view.updateState(editor.view.state);
    }, [editor, isEditable]);

    // Effect to handle cleanup and force updates
    useEffect(() => {
        if (editor && prevEditableRef.current !== isEditable) {
            // Force a re-render of all node views
            editor.view.updateState(editor.view.state);

            if (isEditable) {
                // Clear student selections when switching to edit mode
                editor.state.doc.descendants((node: Node, pos: number) => {
                    if (node.type.name === 'mcq') {
                        editor.chain()
                            .focus()
                            .command(({ tr }) => {
                                tr.setNodeAttribute(pos, 'selectedAnswer', null);
                                return true;
                            })
                            .run();
                    }
                    return true;
                });
            }
            prevEditableRef.current = isEditable;
        }
    }, [isEditable, editor]);

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
