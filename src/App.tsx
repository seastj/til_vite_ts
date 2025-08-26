import { useState } from 'react';
import TodoWrite from './components/todos/TodoWrite';
import type { TodoType } from './types/TodoTypes';
import TodoList from './components/todos/TodoList';

const initialTodos: TodoType[] = [
  { id: '1', title: '할일', completed: false },
  { id: '2', title: '할일', completed: true },
  { id: '3', title: '할일', completed: false },
];
function App() {
  const [todos, setTodos] = useState<TodoType[]>(initialTodos);
  // todos 업데이트
  const addTodo = (newTodo: TodoType): void => {
    setTodos([newTodo, ...todos]);
  };
  // todo completed 토글하기
  const toggleTodo = (id: string): void => {
    const arr = todos.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setTodos(arr);
  };
  // todo 삭제하기
  const deleteTodo = (id: string): void => {
    const arr = todos.filter(item => item.id !== id);
    setTodos(arr);
  };
  // todo 수정하기
  const editTodo = (id: string, editTitle: string): void => {
    const arr = todos.map(item => (item.id === id ? { ...item, title: editTitle } : item));
    setTodos(arr);
  };

  return (
    <div>
      <h1>할일 웹 서비스</h1>
      <div>
        <TodoWrite addTodo={addTodo} />
        <TodoList
          todos={todos}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
          editTodo={editTodo}
        />
      </div>
    </div>
  );
}

export default App;
