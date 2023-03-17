import React from "react";
import ContextTodo from "./ContextTodo";
import JotaiTodo from "./JotaiTodo";
import RecoilTodo from "./RecoilTodo";
import ReduxTodo from "./ReduxTodo";
import ZustandTodo from "./ZustandTodo";

// Create our app
const App: React.FC = () => {
  return (
    <main>
      <h1>Test Flux Implementation</h1>
      <section style={{ display: "flex", gap: "1em", flexWrap: "wrap" }}>
        <RecoilTodo />
        <ReduxTodo />
        <ContextTodo />
        <JotaiTodo />
        <ZustandTodo />
      </section>
    </main>
  );
};

export default App;
