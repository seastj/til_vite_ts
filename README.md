# useState

## 기본 폴더 구조 생성

- /src/components 폴더 생성
- /src/components/Counter.jsx 파일 생성
- 실제 프로젝트에서 tsx 가 어렵다면, jsx 로 작업 후 ai 사용하여 tsx 로 변환.

### ts 프로젝트에서 jsx 를 사용하도록 설정하기

- `tsconfig.app.json` 수정

```json
{
  "compilerOptions": {
    "composite": true, // ← 프로젝트 참조 사용 시 필요
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "allowJs": true,
    "checkJs": false,

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- `.vscode/settings.json` 수정

```json
{
  "files.autoSave": "off",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "typescript.suggest.autoImports": true,
  "typescript.suggest.paths": true,
  "javascript.suggest.autoImports": true,
  "javascript.suggest.paths": true,

  // 워크스페이스 TS 사용(강력 권장)
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## useState 활용해보기

- App.tsx

```tsx
import Counter from './components/Counter';

function App() {
  return (
    <div>
      <h1>App</h1>
      <Counter />
    </div>
  );
}

export default App;
```

- Counter.jsx

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const add = () => {
    setCount(count + 1);
  };
  const minus = () => {
    setCount(count - 1);
  };
  const reset = () => {
    setCount(0);
  };
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={add}>증가</button>
      <button onClick={minus}>감소</button>
      <button onClick={reset}>리셋</button>
    </div>
  );
}

export default Counter;
```

- 위의 코드를 tsx 로 마이그레이션 진행
- 확장자를 `tsx` 로 변경

```tsx
import { useState } from 'react';

type CounterProps = {};
type VoidFun = () => void;

function Counter({}: CounterProps): JSX.Element {
  const [count, setCount] = useState<number>(0);
  const add: VoidFun = () => {
    setCount(count + 1);
  };
  const minus: VoidFun = () => {
    setCount(count - 1);
  };
  const reset: VoidFun = () => {
    setCount(0);
  };
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={add}>증가</button>
      <button onClick={minus}>감소</button>
      <button onClick={reset}>리셋</button>
    </div>
  );
}

export default Counter;
```

- 사용자 이름 편집 기능 예제
- /src/components/NameEditor.jsx

```jsx
import { useState } from 'react';

function NameEditor() {
  const [name, setName] = useState('');

  const handleChange = e => {
    setName(e.target.value);
  };
  const handleSave = () => {
    setName('');
  };

  return (
    <div>
      <h2>NameEditor : {name}</h2>
      <div>
        <input type="text" value={name} onChange={e => handleChange(e)} />
        <button onClick={handleSave}>확인</button>
      </div>
    </div>
  );
}

export default NameEditor;
```

- tsx 로 마이그레이션 : 확장자 수정

```tsx
import { useState } from 'react';

type NameEditorProps = {
  children?: React.ReactNode;
};

function NameEditor({ children }: NameEditorProps): JSX.Element {
  const [name, setName] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };
  const handleSave = () => {
    setName('');
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter 입력');
    }
  };

  return (
    <div>
      <h2>NameEditor : {name}</h2>
      <div>
        <input
          type="text"
          value={name}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
        />
        <button onClick={handleSave}>확인</button>
      </div>
    </div>
  );
}

export default NameEditor;
```

- /src/components/User.jsx 생성

```jsx
import { useState } from 'react';

const User = () => {
  const [user, setUser] = useState({ name: '홍길동', age: 10 });
  const handleClick = () => {
    setUser({ ...user, age: user.age + 1 });
  };
  return (
    <div>
      <h2>
        User : {user.name}님의 나이는 {user.age}살입니다.
      </h2>
      <div>
        <button onClick={handleClick}>나이 증가</button>
      </div>
    </div>
  );
};

export default User;
```

- tsx 로 마이그레이션

```tsx
import { useEffect, useState } from 'react';

type UserProps = {
  children?: React.ReactNode;
  name: string;
  age: number;
};

export type UserType = {
  name: string;
  age: number;
};

const User = ({ name, age }: UserProps): JSX.Element => {
  const [user, setUser] = useState<UserType | null>(null);
  const handleClick = () => {
    if (user) {
      setUser({ ...user, age: user.age + 1 });
    }
  };

  useEffect(() => {
    setUser({ name, age });
  }, []);
  return (
    <div>
      <h2>
        User :{' '}
        {user ? (
          <span>
            {user.name}님의 나이는 {user.age}살입니다.
          </span>
        ) : (
          '사용자 정보가 없습니다.'
        )}
      </h2>
      <div>
        <button onClick={handleClick}>나이 증가</button>
      </div>
    </div>
  );
};

export default User;
```

- 최종 App.tsx

```tsx
import Counter from './components/Counter';
import NameEditor from './components/NameEditor';
import User from './components/User';

function App() {
  return (
    <div>
      <h1>App</h1>
      <Counter />
      <NameEditor />
      <User name="홍길동" age={20} />
    </div>
  );
}

export default App;
```

## todos 만들기

### 1. 파일구조

- /src/components/todos 폴더 생성
- /src/components/todos/TodoList.jsx 파일 생성

```jsx
import { useEffect } from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ todos, toggleTodo, deleteTodo, editTodo }) => {
  useEffect(() => {
    console.log(todos);
  }, []);
  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map(item => (
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
```

- /src/components/todos/TodoWrite.jsx 파일 생성

```jsx
import { useEffect, useState } from 'react';

const TodoWrite = ({ addTodo }) => {
  const [title, setTitle] = useState('');

  const handleChange = e => {
    setTitle(e.target.value);
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      // 엔터시 저장
      handleSave();
    }
  };
  const handleSave = () => {
    if (title.trim()) {
      // 업데이트
      const newTodo = { id: Date.now().toString(), title: title, completed: false };
      addTodo(newTodo);
      setTitle('');
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
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSave}>등록</button>
      </div>
    </div>
  );
};

export default TodoWrite;
```

- /src/components/todos/TodoItem.jsx 파일 생성

```jsx
import { useState } from 'react';

const TodoItem = ({ todo, toggleTodo, deleteTodo, editTodo }) => {
  // 수정중인지
  const [isEdit, setIsEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const handleChangeTitle = e => {
    setEditTitle(e.target.value);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      // 업데이트
    }
  };

  const handleEditSave = () => {
    if (editTitle.trim()) {
      editTodo(todo.id, editTitle);
      setEditTitle('');
      setIsEdit(false);
    }
  };
  const handleEditCancle = () => {
    setEditTitle(todo.title);
    setIsEdit(false);
  };

  return (
    <li>
      {isEdit ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={e => handleChangeTitle(e)}
            onKeyDown={e => handleKeyDown(e)}
          />
          <button onClick={handleEditSave}>저장</button>
          <button onClick={handleEditCancle}>취소</button>
        </>
      ) : (
        <>
          <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
          <span>{todo.title}</span>
          <button onClick={() => setIsEdit(true)}>수정</button>
          <button onClick={() => deleteTodo(todo.id)}>삭제</button>
        </>
      )}
    </li>
  );
};

export default TodoItem;
```

- /src/components/todos/App.jsx 파일 생성

```jsx
import { useState } from 'react';
import TodoList from './components/todos/TodoList';
import TodoWrite from './components/todos/TodoWrite';
const initialTodos = [
  { id: '1', title: '할일', completed: false },
  { id: '2', title: '할일', completed: true },
  { id: '3', title: '할일', completed: false },
];
function App() {
  const [todos, setTodos] = useState(initialTodos);
  // todos 업데이트
  const addTodo = newTodo => {
    setTodos([newTodo, ...todos]);
  };
  // todo completed 토글하기
  const toggleTodo = id => {
    const arr = todos.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setTodos(arr);
  };
  // todo 삭제하기
  const deleteTodo = id => {
    const arr = todos.filter(item => item.id !== id);
    setTodos(arr);
  };
  // todo 수정하기
  const editTodo = (id, editTitle) => {
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
```

### 2. ts 마이그레이션

- /src/types 폴더 생성
- /src/types/TodoTypes.ts 파일 생성

```ts
export interface TodoType {
  id: string;
  title: string;
  completed: boolean;
}
```

- App.tsx 로 변경 (main.tsx 에서 다시 import 하고 새로고침)

```tsx
import { useState } from 'react';
import TodoList from './components/todos/TodoList';
import TodoWrite from './components/todos/TodoWrite';
import type { TodoType } from './types/TodoTypes';

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
```

- TodoWrite.tsx 로 변경 (App.tsx 에서 다시 import 하고 새로고침)

```tsx
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
```

- TodoList.tsx 로 변경 (App.tsx 에서 다시 import 하고 새로고침)

```tsx
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
```

- TodoItem.tsx 로 변경 (App.tsx 에서 다시 import 하고 새로고침)

```tsx
import { useState } from 'react';
import type { TodoType } from '../../types/TodoTypes';

interface TodoItemProps {
  todo: TodoType;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, editTitle: string) => void;
}

const TodoItem = ({ todo, toggleTodo, deleteTodo, editTodo }: TodoItemProps): JSX.Element => {
  // 수정중인지
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(todo.title);

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 업데이트
    }
  };

  const handleEditSave = () => {
    if (editTitle.trim()) {
      editTodo(todo.id, editTitle);
      setEditTitle('');
      setIsEdit(false);
    }
  };
  const handleEditCancle = () => {
    setEditTitle(todo.title);
    setIsEdit(false);
  };

  return (
    <li>
      {isEdit ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={e => handleChangeTitle(e)}
            onKeyDown={e => handleKeyDown(e)}
          />
          <button onClick={handleEditSave}>저장</button>
          <button onClick={handleEditCancle}>취소</button>
        </>
      ) : (
        <>
          <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
          <span>{todo.title}</span>
          <button onClick={() => setIsEdit(true)}>수정</button>
          <button onClick={() => deleteTodo(todo.id)}>삭제</button>
        </>
      )}
    </li>
  );
};

export default TodoItem;
```
