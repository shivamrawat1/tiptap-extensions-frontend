import React from 'react';
import '../../styles/components/_toggle-button.scss';


interface EditableToggleProps {
    isEditable: boolean;
    onToggle: () => void;
}

export const EditableToggle: React.FC<EditableToggleProps> = ({ isEditable, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="toggle-button"
        >
            {isEditable ? 'Switch to View Mode' : 'Switch to Edit Mode'}
        </button>
    );
}; 