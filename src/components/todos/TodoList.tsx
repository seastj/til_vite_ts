import React from 'react';
import { useTodos } from '../../contexts/TodoContext';
import TodoItem from './TodoItem';
import type { Todo } from '../../types/TodoTypes';

type TodoListProps = {};

const TodoList = ({}: TodoListProps): JSX.Element => {
  const { todos } = useTodos();
  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map((item: Todo) => (
          <TodoItem key={item.id} todo={item} />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
