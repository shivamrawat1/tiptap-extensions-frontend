import React from "react";
import { EditorProvider } from "@tiptap/react";
import MenuBar from "./MenuBar";
import { extensions, defaultContent } from "./config";

export const Editor: React.FC = () => {
    return (
        <EditorProvider
            slotBefore={<MenuBar />}
            extensions={extensions}
            content={defaultContent}
        >
            <div />
        </EditorProvider>
    );
};

export default Editor; 