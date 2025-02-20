import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { CommandsExtension } from './extensions/CommandsExtension'
import { MCQExtension } from './extensions/MCQExtension';
import { CodeBlockExtension } from './extensions/CodeBlockExtension';

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
    codeBlock: false,
  }),
  CommandsExtension,
  MCQExtension,
  CodeBlockExtension.configure({
    HTMLAttributes: {
      class: 'python-code-block',
    },
  }),
];

export const defaultContent = `
<h1>Welcome to the editor</h1>
<p>Start typing to see the magic...</p>
`; 