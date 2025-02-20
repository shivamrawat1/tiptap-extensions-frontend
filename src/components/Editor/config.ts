import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { Extension, Editor } from '@tiptap/core';
import { NodeView } from '@tiptap/pm/view';
import { Decoration, DecorationSource } from 'prosemirror-view';
import { Node as ProseMirrorNode } from 'prosemirror-model';

interface CommandMenuState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedNode: HTMLElement | null;
  setSelectedNode: (node: HTMLElement | null) => void;
}

// Custom extension to add the command menu icon
const CommandMenuExtension = Extension.create({
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

    this.editor.view.dom.parentElement?.appendChild(menuContainer);

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
      const paragraph = target.closest('p, h1, h2, h3, h4, h5, h6') as HTMLElement | null;

      if (paragraph) {
        activeElement = paragraph;
        const rect = paragraph.getBoundingClientRect();
        menuContainer.style.display = 'flex';
        menuContainer.style.top = `${rect.top + rect.height / 2 - 12}px`;
        menuContainer.style.left = `${rect.left - 30}px`;
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

export const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure(),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  CommandMenuExtension,
];

export const defaultContent = `
<h1>Welcome to the editor</h1>
<p>Start typing to see the magic...</p>
`; 