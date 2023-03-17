import React, { ReactNode, useRef } from "react";
import { create } from "zustand";

// Define the shape of our state
interface IState {
  id: string;
  title: string;
  done: boolean;
}

interface ITodosStore {
  todos: Record<string, IState>;
  getTodo: (id: string) => IState | undefined;
  addTodo: (title: string) => void;
  removeTodo: (id: string) => void;
  setTodo: (id: string, done: boolean) => void;
}

const useTodosStore = create<ITodosStore>((set, get) => ({
  todos: {},
  getTodo: (id: string) => get().todos[id],
  addTodo: (title: string) => {
    set((state) => {
      const id = Math.random().toString();
      const newState = {
        ...state.todos,
        [id]: { id, title, done: false },
      };
      return { todos: newState };
    });
  },
  removeTodo: (id: string) => {
    set((state) => {
      const { [id]: _, ...remainingTodos } = state.todos;
      return { todos: remainingTodos };
    });
  },
  setTodo: (id: string, done: boolean) =>
    set((state) => {
      const newState = { ...state.todos, [id]: { ...state.todos[id], done } };
      return { todos: newState };
    }),
}));

interface Props {
  children: ReactNode;
}

const MyComponentA: React.FC<Props> = ({ children }) => {
  console.log("Component A rendered");
  return (
    <section>
      <h2>ComponentA</h2>
      <div>{children}</div>
    </section>
  );
};

const MyComponentB: React.FC<Props> = ({ children }) => {
  console.log("Component B rendered");
  return <div>{children}</div>;
};

const TodoList: React.FC = () => {
  const todos = useTodosStore((state) => state.todos);
  const removeTodo = useTodosStore((state) => state.removeTodo);
  const addTodo = useTodosStore((state) => state.addTodo);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleRemoveTodo = (todoId: string) => {
    removeTodo(todoId);
  };

  const handleAddTodo: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const { title } = Object.fromEntries(formData.entries()) as {
      title: string;
    };
    addTodo(title);
    formElement.reset();
    dialogRef.current?.close();
  };

  return (
    <section>
      {Object.values(todos).map((todo) => (
        <Todo todoId={todo.id} key={todo.id} onRemove={handleRemoveTodo} />
      ))}
      <button
        onClick={() => {
          dialogRef.current?.showModal();
        }}
      >
        Add Todo
      </button>
      <dialog ref={dialogRef}>
        <form method="dialog" onSubmit={handleAddTodo}>
          <input
            name="title"
            type="text"
            placeholder="title"
            required
            minLength={2}
          />
          <button type="submit">Save</button>
        </form>
      </dialog>
    </section>
  );
};

const Todo: React.FC<{
  todoId: string;
  onRemove: (todoId: string) => void;
}> = ({ todoId, onRemove }) => {
  const [getTodo, setTodo] = useTodosStore((state) => [
    state.getTodo,
    state.setTodo,
  ]);

  const todo = getTodo(todoId);

  const handleUpdateTodo = () => {
    setTodo(todoId, !todo?.done);
  };

  if (!todo) return null;

  return (
    <li key={todo.id}>
      {todo.title}
      <input type="checkbox" checked={todo.done} onChange={handleUpdateTodo} />
      <button onClick={() => onRemove(todo.id)}>Remove</button>
    </li>
  );
};

// Create our app
const ZustandTodo: React.FC = () => {
  return (
    <section>
      <h1>ZustandTodo</h1>
      <MyComponentA>
        <MyComponentB>
          <TodoList />
        </MyComponentB>
      </MyComponentA>
    </section>
  );
};

export default ZustandTodo;
