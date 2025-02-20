import { Extension } from "@tiptap/core";

interface CommandMenuState {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    selectedNode: HTMLElement | null;
    setSelectedNode: (node: HTMLElement | null) => void;
}

// Custom extension to add the command menu icon
export const CommandMenuExtension = Extension.create({
    name: 'commandMenu',

    addGlobalAttributes() {
        return [
            {
                types: ['paragraph', 'heading'],
                attributes: {
                    showMenu: {
                        default: false,
                        renderHTML: () => ({}),
                        parseHTML: () => false,
                    },
                },
            },
        ];
    },

    onCreate() {
        const menuContainer = document.createElement('div');
        menuContainer.className = 'command-menu-icon';
        menuContainer.innerHTML = '⚙️';
        menuContainer.style.display = 'none';

        const editorContainer = this.editor.view.dom.parentElement;
        if (editorContainer) {
            editorContainer.style.position = 'relative';
            editorContainer.appendChild(menuContainer);
        }

        let activeElement: HTMLElement | null = null;

        // Create a custom event to communicate with React components
        const commandMenuEvent = new CustomEvent<CommandMenuState>('commandMenuClick', {
            detail: {
                isOpen: false,
                setIsOpen: () => { },
                selectedNode: null,
                setSelectedNode: () => { },
            }
        });

        // Handle click on the gear icon
        menuContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeElement) {
                commandMenuEvent.detail.selectedNode = activeElement;
                this.editor.view.dom.dispatchEvent(commandMenuEvent);
            }
        });

        // Handle clicks in the editor
        this.editor.view.dom.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const block = target.closest('p, h1, h2, h3, h4, h5, h6, ul, ol') as HTMLElement | null;

            if (block) {
                activeElement = block;
                const editorRect = this.editor.view.dom.getBoundingClientRect();
                const blockRect = block.getBoundingClientRect();

                // Position relative to the editor's left edge
                menuContainer.style.display = 'flex';
                menuContainer.style.top = `${blockRect.top - editorRect.top + (blockRect.height / 2) - 12}px`;
                menuContainer.style.left = '-30px'; // Fixed position outside the editor
            } else {
                activeElement = null;
                menuContainer.style.display = 'none';
            }
        });

        // Hide menu icon when clicking outside the editor
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (!this.editor.view.dom.contains(target) && !menuContainer.contains(target)) {
                menuContainer.style.display = 'none';
                activeElement = null;
            }
        });
    },
});