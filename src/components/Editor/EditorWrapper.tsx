import React, { useState } from 'react';
import { Editor } from './Editor';
import { EditToggle } from './EditToggle';

export const EditorWrapper: React.FC = () => {
    const [isEditable, setIsEditable] = useState(true);

    return (
        <div className="editor-container">
            <div style={{ marginBottom: '20px' }}>
                <EditToggle isEditable={isEditable} onToggle={() => setIsEditable(!isEditable)} />
            </div>
            <Editor isEditable={isEditable} />
        </div>
    );
};

export default EditorWrapper; 