import React, {
  createContext,
  ReactNode,
  useContext,
  useReducer,
  useRef,
} from "react";

// Define the shape of our state
interface IState {
  id: string;
  title: string;
  done: boolean;
}

type IStore = Record<string, IState>;

// Define action types
type Action =
  | { type: "ADD_TODO"; payload: IState }
  | { type: "REMOVE_TODO"; payload: string }
  | { type: "TOGGLE_TODO"; payload: string };

// Define action creators
const addTodo = (title: string) => ({
  type: "ADD_TODO" as const,
  payload: { id: Math.random().toString(), title, done: false },
});

const removeTodo = (id: string) => ({
  type: "REMOVE_TODO" as const,
  payload: id,
});

const toggleTodo = (id: string) => ({
  type: "TOGGLE_TODO" as const,
  payload: id,
});

// Define reducer
const todosReducer = (state: IStore, action: Action) => {
  switch (action.type) {
    case "ADD_TODO":
      return { ...state, [action.payload.id]: action.payload };
    case "REMOVE_TODO":
      const { [action.payload]: _, ...remainingTodos } = state;
      return remainingTodos;
    case "TOGGLE_TODO":
      return {
        ...state,
        [action.payload]: {
          ...state[action.payload],
          done: !state[action.payload].done,
        },
      };
    default:
      return state;
  }
};

// Create the context
interface IContextProps {
  state: IStore;
  dispatch: React.Dispatch<Action>;
}

export const TodosContext = createContext<IContextProps>({
  state: {},
  dispatch: () => {},
});

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
  const { state: todos, dispatch } = React.useContext(TodosContext);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleAddTodo: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const { title } = Object.fromEntries(formData.entries()) as {
      title: string;
    };
    dispatch(addTodo(title));
    formElement.reset();
    dialogRef.current?.close();
  };

  return (
    <section>
      {Object.values(todos).map((todo: IState) => (
        <Todo key={todo.id} todoId={todo.id} />
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
}> = ({ todoId }) => {
  const { state, dispatch } = useContext(TodosContext);
  const { [todoId]: todo } = state;

  const handleUpdateTodo = () => {
    dispatch(toggleTodo(todoId));
  };

  const handleRemoveTodo = () => {
    dispatch(removeTodo(todoId));
  };

  return (
    <li key={todo.id}>
      {todo.title}
      <input type="checkbox" checked={todo.done} onChange={handleUpdateTodo} />
      <button onClick={handleRemoveTodo}>Remove</button>
    </li>
  );
};

// Create our app
const ContextTodo = () => {
  const [state, dispatch] = useReducer(todosReducer, {});
  return (
    <TodosContext.Provider value={{ state, dispatch }}>
      <section>
        <h1>ContextTodo</h1>
        <MyComponentA>
          <MyComponentB>
            <TodoList />
          </MyComponentB>
        </MyComponentA>
      </section>
    </TodosContext.Provider>
  );
};

export default ContextTodo;
