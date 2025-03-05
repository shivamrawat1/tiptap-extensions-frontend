## Demo
[Link](https://www.loom.com/share/17f1ca0c70d44952a69823292ff23017?sid=5a48a226-86e7-47a5-aaab-3de9a6671f1e)

Link to Backend Repo: https://github.com/shivamrawat1/tiptap-extensions-backend

# Interactive Code Learning Platform
Implemented custom extensions for the TipTap editor.

## Prerequisites

- Node.js (v18.x.x)
- Python (3.11.0)
- pip (Python package manager)
- npm

## Getting Started

### Frontend Setup

1. Navigate to the frontend directory

```bash
cd tiptap-extensions-frontend
```

2. Install dependencies

```bash
npm install
```

3. Run the frontend server

```bash
npm start
```

## Add .env files

1. Create a .env file in the backend directory

```bash
touch .env
```

2. Add the following variables to the .env file

```bash
OPENAI_API_KEY=your_openai_api_key
```

3 .Similarly, create a .env file in the frontend directory and add the following variables:

```bash
REACT_APP_API_BASE_URL=http://127.0.0.1:4000
```
**Note**: Use this port if you are running the backend server on port 4000.

## Features

### 1. CodeBlock Extension (with LLMs based Hints)
The CodeBlock extension transforms the editor into an interactive coding environment. Users can write, execute, and debug Python code directly within the document. Each code block comes with an AI-powered hint system that leverages Large Language Models to provide contextual assistance when students are stuck. The extension includes features like real-time code execution, syntax highlighting through Monaco Editor, and the ability to create custom test cases for validation. 

### 2. CommandsMenu Extension (Add Nodes with / Commands)
The CommandsMenu extension provides a slash-command interface (triggered by typing '/') that enables quick insertion of various content blocks. Users can efficiently add code blocks, MCQs, headings, and lists without leaving the keyboard. The menu features fuzzy search capabilities, keyboard navigation, and custom command suggestions based on the current context, making document structuring fast and intuitive.

### 3. BubbleMenu Extension (Inline Toolbar)
The BubbleMenu extension offers a context-sensitive formatting toolbar that appears when text is selected. This floating menu provides quick access to common text formatting options (Marks in TipTap) like bold, italic, and strike-through. The menu is position-aware, ensuring it remains within viewport bounds, and includes subtle animations for a polished user experience. It's designed to minimize mouse movement while maintaining full formatting capabilities.

## Design decisions / Tradeoffs you made

1. **Synchronous vs Asynchronous Hint Generation**: Implemented synchronous hint generation with loading states rather than streaming responses, favoring simplicity over real-time feedback.

2. **Client-Side State Management**: Opted for local state management using React's useState/useEffect instead of global state management, keeping the implementation simpler for the current scope but potentially limiting scalability.

3. **Python Code Execution**: Chose server-side execution with safety constraints over WebAssembly alternatives, prioritizing security and control over offline capabilities.

4. **View/Edit Mode Toggle**: Implemented a global edit/view mode instead of per-component toggles, simplifying the UI but reducing granular control. The view and edit mode act as the student and author/teacher mode respectively - as required by the project.
