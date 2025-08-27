import React, { createContext, useContext, useReducer } from 'react';
import type { TodoType } from '../types/TodoTypes';

// 1. 초기값
type TodosState = { todos: TodoType[] };

const initialState: TodosState = {
  todos: [],
};
// 2. 리듀서
// action 은 { type : "문자열 ", payload: 재료 } 형태
enum TodoActionType {
  ADD = 'ADD',
  DELETE = 'DELETE',
  TOGGLE = 'TOGGLE',
  EDIT = 'EDIT',
}

type AddAction = { type: TodoActionType.ADD; payload: { todo: TodoType } };
type DeleteAction = { type: TodoActionType.DELETE; payload: { id: string } };
type ToggleAction = { type: TodoActionType.TOGGLE; payload: { id: string } };
type EditAction = { type: TodoActionType.EDIT; payload: { id: string; title: string } };

function reducer(state: TodosState, action: AddAction | DeleteAction | ToggleAction | EditAction) {
  switch (action.type) {
    case TodoActionType.ADD: {
      const { todo } = action.payload;
      return { ...state, todos: [todo, ...state.todos] };
    }

    case TodoActionType.TOGGLE: {
      const { id } = action.payload;
      const arr = state.todos.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      return { ...state, todos: arr };
    }
    case TodoActionType.DELETE: {
      const { id } = action.payload;
      const arr = state.todos.filter(item => item.id !== id);
      return { ...state, todos: arr };
    }
    case TodoActionType.EDIT: {
      const { id, title } = action.payload;
      const arr = state.todos.map(item => (item.id === id ? { ...item, title } : item));
      return { ...state, todos: arr };
    }
    default:
      return state;
  }
}
// 3. context 생성
// 만들어진 Context 가 관리하는 value 의 모양
type TodoContextValue = {
  todos: TodoType[];
  addTodo: (todo: TodoType) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, editTitle: string) => void;
};
const TodoConText = createContext<null | TodoContextValue>(null);

// 4. provider 생성
type TodoProviderProps = {
  children?: React.ReactNode;
};
export const TodoProvider = ({ children }: TodoProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // dispatch 를 위한 함수 표현식 모음
  const addTodo = (newTodo: TodoType) => {
    dispatch({ type: TodoActionType.ADD, payload: { todo: newTodo } });
  };
  const toggleTodo = (id: string) => {
    dispatch({ type: TodoActionType.TOGGLE, payload: { id } });
  };
  const deleteTodo = (id: string) => {
    dispatch({ type: TodoActionType.DELETE, payload: { id } });
  };
  const editTodo = (id: string, editTitle: string) => {
    dispatch({ type: TodoActionType.EDIT, payload: { id, title: editTitle } });
  };
  // value 전달할 값
  const value: TodoContextValue = {
    todos: state.todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
  };
  return <TodoConText.Provider value={value}>{children}</TodoConText.Provider>;
};

// 5. custom hook 생성
export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoConText);
  if (!ctx) {
    throw new Error('컨텍스트가 없습니다.');
  }
  return ctx;
}
