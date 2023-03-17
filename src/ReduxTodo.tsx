import React, { ReactNode, useRef } from "react";
import { createStore } from "redux";
import { Provider, useDispatch, useSelector } from "react-redux";

// Define the shape of our state
interface IState {
  id: string;
  title: string;
  done: boolean;
}

type IStore = Record<string, IState>;

// Define action types
const ADD_TODO = "ADD_TODO";
const REMOVE_TODO = "REMOVE_TODO";
const TOGGLE_TODO = "TOGGLE_TODO";

// Define action creators
const addTodo = (title: string) => ({
  type: ADD_TODO,
  payload: { id: Math.random().toString(), title, done: false },
});

const removeTodo = (id: string) => ({
  type: REMOVE_TODO,
  payload: { id },
});

const toggleTodo = (id: string) => ({
  type: TOGGLE_TODO,
  payload: { id },
});

// Define reducer
const todosReducer = (state: IStore = {}, action: any) => {
  switch (action.type) {
    case ADD_TODO:
      return { ...state, [action.payload.id]: action.payload };
    case REMOVE_TODO:
      const { [action.payload.id]: _, ...remainingTodos } = state;
      return remainingTodos;
    case TOGGLE_TODO:
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          done: !state[action.payload.id].done,
        },
      };
    default:
      return state;
  }
};

// Create the store
const store = createStore(todosReducer);

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
  const todos = useSelector<IStore, IStore>((state) => state);
  const dispatch = useDispatch();

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
  const todo = useSelector<Record<string, IState>, IState>(
    (state) => state[todoId]
  );
  const dispatch = useDispatch();

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
const ReduxTodo = () => {
  return (
    <Provider store={store}>
      <section>
        <h1>ReduxTodo</h1>
        <MyComponentA>
          <MyComponentB>
            <TodoList />
          </MyComponentB>
        </MyComponentA>
      </section>
    </Provider>
  );
};

export default ReduxTodo;
