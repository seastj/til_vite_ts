import React from 'react';
import { createTodo } from './services/todoService';

function App() {
  const addTodo = async (): Promise<void> => {
    const result = await createTodo({ title: '할일 입니다.', content: '내용 입니다.' });
    if (result) {
      console.log(result);
    }
  };
  return (
    <div>
      <button onClick={addTodo}>할일 추가</button>
    </div>
  );
}

export default App;
