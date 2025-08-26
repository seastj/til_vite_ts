import type { TodoType } from '../../types/TodoTypes';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: TodoType[];
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, editTitle: string) => void;
}

const TodoList = ({ todos, toggleTodo, deleteTodo, editTodo }: TodoListProps): JSX.Element => {
  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map((item: any) => (
          <TodoItem
            key={item.id}
            todo={item}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
            editTodo={editTodo}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
