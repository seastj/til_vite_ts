import React, { createContext, useContext, useEffect, useReducer } from 'react';
// 전체 DB 가져오기
import { getTodos } from '../services/todoService';
import type { Todo } from '../types/TodoTypes';

// 1. 초기값
type TodosState = { todos: Todo[] };

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
  // Supabase todos 의 목록읽기
  SET_TODOS = 'SET_TODOS',
}

type AddAction = { type: TodoActionType.ADD; payload: { todo: Todo } };
type DeleteAction = { type: TodoActionType.DELETE; payload: { id: number } };
type ToggleAction = { type: TodoActionType.TOGGLE; payload: { id: number } };
type EditAction = { type: TodoActionType.EDIT; payload: { id: number; title: string } };
// Supabase 목록으로 state.todos 배열을 채워라.
type SetTodosAction = { type: TodoActionType.SET_TODOS; payload: { todos: Todo[] } };

function reducer(
  state: TodosState,
  action: AddAction | DeleteAction | ToggleAction | EditAction | SetTodosAction,
) {
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
    // Supabase 의 목록 읽기
    case TodoActionType.SET_TODOS: {
      const { todos } = action.payload;
      return { ...state, todos };
    }
    default:
      return state;
  }
}
// 3. context 생성
// 만들어진 Context 가 관리하는 value 의 모양
type TodoContextValue = {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, editTitle: string) => void;
};
const TodoConText = createContext<null | TodoContextValue>(null);

// 4. provider 생성
type TodoProviderProps = {
  children?: React.ReactNode;
};
export const TodoProvider = ({ children }: TodoProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // dispatch 를 위한 함수 표현식 모음
  const addTodo = (newTodo: Todo) => {
    dispatch({ type: TodoActionType.ADD, payload: { todo: newTodo } });
  };
  const toggleTodo = (id: number) => {
    dispatch({ type: TodoActionType.TOGGLE, payload: { id } });
  };
  const deleteTodo = (id: number) => {
    dispatch({ type: TodoActionType.DELETE, payload: { id } });
  };
  const editTodo = (id: number, editTitle: string) => {
    dispatch({ type: TodoActionType.EDIT, payload: { id, title: editTitle } });
  };
  // 실행시 state { todos } 를 업데이트한다.
  // reducer 함수를 실행함.
  const setTodos = (todos: Todo[]) => {
    dispatch({ type: TodoActionType.SET_TODOS, payload: { todos } });
  };
  // Supabase 의 목록 읽기 함수 표현식
  // 비동기 데이터베이스 접근
  const loadTodos = async (): Promise<void> => {
    try {
      const result = await getTodos();
      setTodos(result);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    loadTodos();
  }, []);
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
