import { useState } from 'react';
import type { TodoType } from '../../types/TodoTypes';

type TodoWriteProps = {
  children?: React.ReactNode;
  addTodo: (newTodo: TodoType) => void;
};

const TodoWrite = ({ addTodo }: TodoWriteProps) => {
  const [title, setTitle] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSave = () => {
    if (title.trim()) {
      // 업데이트
      const newTodo: TodoType = { id: Date.now().toString(), title: title, completed: false };
      addTodo(newTodo);
      setTitle('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 엔터시 저장
      handleSave();
    }
  };

  return (
    <div>
      <h2>할일 작성</h2>
      <div>
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
        />
        <button onClick={handleSave}>등록</button>
      </div>
    </div>
  );
};

export default TodoWrite;
