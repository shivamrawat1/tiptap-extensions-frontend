import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import './CommandsView.scss';

export interface CommandProps {
    title: string;
    description: string;
    attrs: Record<string, string>;
    command: ({ editor, range }: { editor: any; range: any }) => void;
}

interface CommandsViewProps {
    items: CommandProps[];
    command: ({ command }: { command: CommandProps }) => void;
}

// Add this interface to define the ref methods
interface CommandViewRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const CommandsView = forwardRef<CommandViewRef, CommandsViewProps>((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command({ command: item });
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }
            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }
            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }
            return false;
        },
    }));

    return (
        <div className="commands-view">
            {props.items.length ? (
                props.items.map((item, index) => (
                    <button
                        className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                        key={index}
                        onClick={() => selectItem(index)}
                        {...item.attrs}
                    >
                        <div className="command-title">{item.title}</div>
                        <div className="command-description">{item.description}</div>
                    </button>
                ))
            ) : (
                <div className="command-item">No results</div>
            )}
        </div>
    );
}); 