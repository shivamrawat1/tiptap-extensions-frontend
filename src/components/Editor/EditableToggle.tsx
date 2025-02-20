import React from 'react';

interface EditableToggleProps {
    isEditable: boolean;
    onToggle: () => void;
}

export const EditableToggle: React.FC<EditableToggleProps> = ({ isEditable, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            {isEditable ? 'Switch to View Mode' : 'Switch to Edit Mode'}
        </button>
    );
}; 