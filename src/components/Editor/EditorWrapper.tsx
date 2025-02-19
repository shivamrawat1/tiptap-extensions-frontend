import React, { useState, useCallback } from 'react';
import { Editor } from './Editor';
import { EditToggle } from './EditToggle';

export const EditorWrapper: React.FC = () => {
    const [isEditable, setIsEditable] = useState(true);

    const handleToggle = useCallback(() => {
        setIsEditable(prev => !prev);
    }, []);

    return (
        <div className="editor-container">
            <div style={{ marginBottom: '20px' }}>
                <EditToggle
                    isEditable={isEditable}
                    onToggle={handleToggle}
                />
            </div>
            <Editor isEditable={isEditable} />
        </div>
    );
};

export default EditorWrapper; 