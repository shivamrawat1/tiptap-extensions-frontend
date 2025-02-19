import React from "react";
import EditorWrapper from "./components/Editor/EditorWrapper";
import "./styles/main.scss";

const App: React.FC = () => {
  return (
    <div className="app">
      <EditorWrapper />
    </div>
  );
};

export default App;
