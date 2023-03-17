import React, { ReactNode, useRef } from "react";
import { atom, useAtom } from "jotai";

// Define the shape of our state
interface IState {
  id: string;
  title: string;
  done: boolean;
}

const todosStore = atom<Record<string, IState>>({});

const todoAtom = atom(
  (get) => (id: string) => {
    const todos = get(todosStore);
    return todos[id];
  },
  (get, set, { id, done }: { id: string; done: boolean }) => {
    const todos = get(todosStore);
    const newTodos = { ...todos, [id]: { ...todos[id], done } };
    set(todosStore, newTodos);
  }
);

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
  const [todos, setTodos] = useAtom(todosStore);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleRemoveTodo = (todoId: string) => {
    setTodos((preTodos) => {
      const { [todoId]: _, ...remainingTodos } = preTodos;
      return remainingTodos;
    });
  };

  const handleAddTodo: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const { title } = Object.fromEntries(formData.entries()) as {
      title: string;
    };
    const id = Math.random();
    setTodos((prevTodos) => ({
      ...prevTodos,
      [id]: { id, title, done: false },
    }));
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
  const [getTodo, setTodo] = useAtom(todoAtom);

  const todo = getTodo(todoId);

  const handleUpdateTodo = () => {
    setTodo({ id: todoId, done: !todo.done });
  };

  return (
    <li key={todo.id}>
      {todo.title}
      <input type="checkbox" checked={todo.done} onChange={handleUpdateTodo} />
      <button onClick={() => onRemove(todo.id)}>Remove</button>
    </li>
  );
};

// Create our app
const JotaiTodo: React.FC = () => {
  return (
    <section>
      <h1>JotaiApp</h1>
      <MyComponentA>
        <MyComponentB>
          <TodoList />
        </MyComponentB>
      </MyComponentA>
    </section>
  );
};

export default JotaiTodo;
