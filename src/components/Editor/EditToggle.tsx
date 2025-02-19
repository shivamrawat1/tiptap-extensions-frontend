import React from 'react';

interface EditToggleProps {
    isEditable: boolean;
    onToggle: () => void;
}

export const EditToggle: React.FC<EditToggleProps> = ({ isEditable, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="edit-toggle"
            style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '8px 16px',
                backgroundColor: isEditable ? '#e0e0e0' : '#4a4a4a',
                color: isEditable ? '#000' : '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            }}
        >
            {isEditable ? 'Switch to View Mode' : 'Switch to Edit Mode'}
        </button>
    );
};

export default EditToggle; 