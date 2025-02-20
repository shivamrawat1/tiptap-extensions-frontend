import { Extension } from '@tiptap/core';
import { Editor } from '@tiptap/core';
import { Range } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance, GetReferenceClientRect } from 'tippy.js';
import { CommandsView } from '../CommandsView';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

// Define the interface here since we need it in this file
interface CommandItem {
    title: string;
    description: string;
    attrs: Record<string, string>;
    command: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

// Add this interface to define the ref type
interface CommandViewRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const CommandsExtension = Extension.create({
    name: 'commandMenu',

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                char: '/',
                command: ({ editor, range, props }) => {
                    if (props.command) {
                        props.command({ editor, range });
                    }
                },
                items: ({ query }) => {
                    const items: CommandItem[] = [
                        {
                            title: 'Heading 1',
                            description: 'Large section heading',
                            attrs: { 'data-test-id': 'insert-heading1' },
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setNode('heading', { level: 1 })
                                    .run();
                            },
                        },
                        {
                            title: 'Heading 2',
                            description: 'Medium section heading',
                            attrs: { 'data-test-id': 'insert-heading2' },
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setNode('heading', { level: 2 })
                                    .run();
                            },
                        },
                        {
                            title: 'Bullet List',
                            description: 'Create a simple bullet list',
                            attrs: { 'data-test-id': 'insert-bullet-list' },
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .toggleBulletList()
                                    .run();
                            },
                        },
                        {
                            title: 'Numbered List',
                            description: 'Create a numbered list',
                            attrs: { 'data-test-id': 'insert-ordered-list' },
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .toggleOrderedList()
                                    .run();
                            },
                        },
                        {
                            title: 'Code Block',
                            description: 'Add a code block',
                            attrs: { 'data-test-id': 'insert-code' },
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setCodeBlock()
                                    .run();
                            },
                        },
                        {
                            title: 'Quiz',
                            description: 'Add a multiple choice question',
                            attrs: { 'data-test-id': 'insert-mcq' },
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .setMCQ()
                                    .run();
                            },
                        },
                    ];

                    return items
                        .filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()))
                        .slice(0, 10);
                },
                render: () => {
                    let component: ReactRenderer;
                    let popup: Instance;
                    const defaultRect: DOMRect = new DOMRect(0, 0, 0, 0);

                    return {
                        onStart: (props) => {
                            // Create a wrapper for the command handling
                            const commandHandler = (commandProps: { command: CommandItem }) => {
                                const { command } = commandProps;
                                command.command({ editor: props.editor, range: props.range });
                            };

                            // Create new props with the wrapped command handler
                            const enhancedProps = {
                                items: props.items,
                                command: commandHandler,
                                editor: props.editor,
                                range: props.range,
                            };

                            component = new ReactRenderer(CommandsView, {
                                props: enhancedProps,
                                editor: props.editor,
                            });

                            const getReferenceClientRect: GetReferenceClientRect = () => {
                                return props.clientRect?.() || defaultRect;
                            };

                            popup = tippy(props.editor.options.element, {
                                getReferenceClientRect,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'bottom-start',
                            });
                        },
                        onUpdate: (props) => {
                            // Create the same wrapper for updates
                            const commandHandler = (commandProps: { command: CommandItem }) => {
                                const { command } = commandProps;
                                command.command({ editor: props.editor, range: props.range });
                            };

                            const enhancedProps = {
                                items: props.items,
                                command: commandHandler,
                                editor: props.editor,
                                range: props.range,
                            };

                            component.updateProps(enhancedProps);

                            const getReferenceClientRect: GetReferenceClientRect = () => {
                                return props.clientRect?.() || defaultRect;
                            };

                            popup.setProps({
                                getReferenceClientRect,
                            });
                        },
                        onKeyDown: ({ event }) => {
                            if (event.key === 'Escape') {
                                popup.hide();
                                return true;
                            }

                            const ref = component.ref as unknown as CommandViewRef;
                            return ref?.onKeyDown({ event });
                        },
                        onExit: () => {
                            popup.destroy();
                            component.destroy();
                        },
                    };
                },
            }),
        ];
    },
}); 