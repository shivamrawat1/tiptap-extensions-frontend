import React, { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { EditorBubbleMenu } from "./BubbleMenu";
import { CommandMenu } from "./CommandMenu";
import { extensions, defaultContent } from "./config";
import '../../styles/components/bubblebar.scss';
import '../../styles/components/_command-menu.scss';

export const Editor: React.FC = () => {
    const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState<HTMLElement | null>(null);

    const editor = useEditor({
        extensions,
        content: defaultContent,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
            },
        },
    });

    useEffect(() => {
        if (!editor) return;

        const handleCommandMenuClick = (e: Event) => {
            const event = e as CustomEvent;
            const rect = event.detail.selectedNode.getBoundingClientRect();
            setSelectedNode(event.detail.selectedNode);
            setMenuPosition({ x: rect.left - 30, y: rect.top + rect.height });
            setIsCommandMenuOpen(true);
        };

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.command-menu') && !target.closest('.command-menu-icon')) {
                setIsCommandMenuOpen(false);
            }
        };

        editor.view.dom.addEventListener('commandMenuClick', handleCommandMenuClick);
        document.addEventListener('click', handleClickOutside);

        return () => {
            editor.view.dom.removeEventListener('commandMenuClick', handleCommandMenuClick);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [editor]);

    return (
        <div className="editor-wrapper">
            {editor && <EditorBubbleMenu editor={editor} />}
            {editor && isCommandMenuOpen && selectedNode && (
                <CommandMenu
                    editor={editor}
                    isOpen={isCommandMenuOpen}
                    setIsOpen={setIsCommandMenuOpen}
                    style={{
                        position: 'absolute',
                        left: `${menuPosition.x}px`,
                        top: `${menuPosition.y}px`,
                    }}
                />
            )}
            <EditorContent editor={editor} />
        </div>
    );
};

export default Editor; 
