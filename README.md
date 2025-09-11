# profiles 테이블에 추가 정보시 오류 발생

- RLS 정책으로 회원이 아니면 CRUD 를 하지못한다.

## 1. 기존 방식

- 회원가입 > profiles 에 insert 진행함 (오류발생)
- 회원가입 > 이메일인증 > 인증 확인 > profiles 에 insert 필요.

## 2. 회원가입 진행 과정 개선

- /src/pages/SignUpPage.tsx 수정

```tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import type { ProfileInsert } from '../types/TodoTypes';

function SignUpPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  // 추가 정보 (닉네임)
  const [nickName, setNickName] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 웹 브라우저 갱신 막기
    e.preventDefault();

    if (!email.trim()) {
      alert('이메일을 입력하세요.');
      return;
    }

    if (!pw.trim()) {
      alert('비밀번호를 입력하세요.');
      return;
    }
    if (pw.length < 6) {
      alert('비밀번호는 최소 6자 이상입니다.');
      return;
    }

    if (!nickName.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }

    // 회원가입 하기 및 추가정보 입력하기
    const { error, data } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // 잠시 추가정보를 보관함.
        // Supabase 에서 auth 에는 추가적인 정보를 저장하는 객체가 존재
        // 공식적인 명칭은 metadata 라고 한다.
        // 이메일 인증 후에 프로필 생성시에 사용하려고 보관
        data: { nickName: nickName },
      },
    });
    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(
        '회원가입이 성공했습니다. 이메일 인증 링크를 확인해주세요. 인증 완료 후 프로필이 자동으로 생성됩니다.',
      );
      // 회원가입 성공했으므로 profiles 도 채워준다.
      if (data?.user?.id) {
        // 프로필을 추가한다.
        const newUser: ProfileInsert = { id: data.user.id, nickname: nickName };
        const result = await createProfile(newUser);
        if (result) {
          // 프로필 추가가 성공한 경우
          setMsg('회원가입 및 프로필 생성 성공했습니다. 이메일 인증 링크를 확인해주세요.');
        } else {
          // 프로필 추가가 실패한 경우
          setMsg('회원가입은 성공, 프로필 생성은 실패했습니다.');
        }
      } else {
        setMsg('회원가입이 성공했습니다. 이메일 인증 링크를 확인해주세요.');
      }
    }
  };
  return (
    <div>
      <h2>Todo 서비스 회원가입</h2>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일"
          />
          <br />
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="비밀번호"
          />
          <br />
          <input
            type="text"
            value={nickName}
            onChange={e => setNickName(e.target.value)}
            placeholder="닉네임"
          />
          <br />
          <button type="submit">회원가입</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default SignUpPage;
```

- /src/pages/AuthCallback.tsx 변경

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ProfileInsert } from '../types/TodoTypes';
import { createProfile } from '../lib/profile';

/**
 *  - 인증 콜백 URL 처리
 *  - 사용자에게 인증 진행 상태 안내
 *  - 자동 인증 처리 완료 안내
 */
function AuthCallback() {
  const [msg, setMsg] = useState<string>('인증 처리 중 ...');

  // 사용자가 이메일 확인 클릭하면 실행되는 곳
  // 인증 정보에 담겨진 nickname 을 알아내서 여기서 profiles 를 추가
  const handleAuthCallback = async (): Promise<void> => {
    try {
      // URL 에서 세션(웹 브라우저 정보시 사라지는 데이터)에 담겨진 정보를 가져온다.
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMsg(`인증 오류 : ${error.message}`);
        return;
      }
      // 인증 데이터가 존재함.
      if (data.session?.user) {
        const user = data.session.user;
        // 추가적인 정보 파악 가능 (metadata 라고 함.)
        const nickName = user.user_metadata.nickName;

        // 먼저 프로필이 이미 존재하는지 확인이 필요
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        // 존재하지 않는 id 이고, nickName 내용이 있다면
        // profiles 에 insert 한다.
        if (!existingProfile && nickName) {
          // 프로필이 없고 닉네임이 존재하므로 프로필 생성한다.
          const newProfile: ProfileInsert = { id: user.id, nickname: nickName };
          const result = await createProfile(newProfile);
          if (result) {
            setMsg('✔ 이메일 인증 완료. 프로필 생성 성공! 홈으로 이동하세요.');
          } else {
            setMsg('✔ 이메일 인증 완료. 프로필 생성 실패 : 관리자에게 문의하세요.');
          }
        } else {
          setMsg('✔ 이메일 인증 완료. 홈으로 이동하세요.');
        }
      } else {
        setMsg('인증 정보가 없습니다. 다시 가입해주세요.');
      }
    } catch (err) {
      console.log(`인증 콜백 함수 처리 오류 : ${err}`);
      setMsg('인증 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    // setTimeout 은 1초 뒤에 함수 실행
    const timer = setTimeout(handleAuthCallback, 1000);
    // 클린업 함수
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div>
      <h2>인증 페이지</h2>
      <h2>{msg}</h2>
    </div>
  );
}

export default AuthCallback;
```

- /src/lib/profile.ts 수정

```ts
// 사용자 프로필 생성
const createProfile = async (newUserProfile: ProfileInsert): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('profiles').insert([{ ...newUserProfile }]);
    if (error) {
      console.log(`프로필 추가에 실패 : `, {
        message: error.message,
        detail: error.details,
        hint: error.hint,
        code: error.code,
      });
      return false;
    }
    console.log(`프로필 생성 성공 : `, data);
    return true;
  } catch (error) {
    console.log(`프로필 생성 오류 : ${error}`);
    return false;
  }
};
```

# 일반적 네비게이션 진행하기

- npm : https://www.npmjs.com/package/react-paginate
- 직접 구현 진행.

## 1. 구현 시나리오

- 한 화면에 10개의 목록을 표시함.
- 페이지 번호로 네비게이션 함.
- 전체 개수 및 현재 페이지 정보 출력함.
- supabase 에 todos 를 이용함.

## 2. 코드 구현

## 2.1. /src/service/todoService.ts

- 페이지 변화와 제한 개수를 이용해서 추출하기 함수

```ts
// 페이지 단위로 조각내서 목록 출력하기
// getTodosPaginated(1, 10개)
// getTodosPaginated(2, 10개)
// getTodosPaginated(페이지번호, 10개)
export const getTodosPaginated = async (
  page: number = 1,
  limit: number = 10,
): Promise<{ todos: Todo[]; totalCount: number; totalPages: number; currentPage: number }> => {
  // 시작
  // page=2, limit 10
  // (2-1) * 10 => 10
  const from = (page - 1) * limit;
  // 제한
  // 10 + 10 - 1 => 19
  const to = from + 1 + limit - 1;

  // 전체 데이터 개수 (row 의 개수)
  const { count } = await supabase.from('todos').select('*', { count: 'exact', head: true });

  // from 부터 to 까지의 상세 데이터
  const { data } = await supabase
    .from('todos')
    .select('*')
    .order(`created_at`, { ascending: false })
    .range(from, to);
  // 편하게 활용
  const totalCount = count || 0;
  // 몇페이지 인지 계산 (소숫점은 올림)
  const totalPages = Math.ceil(totalCount / limit);
  return {
    todos: data || [],
    totalCount,
    totalPages,
    currentPage: page,
  };
};
```

### 2.2. /src/contexts/TodoContext.tsx

```tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type PropsWithChildren,
} from 'react';
// 전체 DB 가져오기
import type { Todo } from '../types/TodoTypes';
import { getTodosPaginated } from '../services/todoService';

// 1. 초기값 형태가 페이지 객체 형태로 추가
type TodosState = { todos: Todo[]; totalCount: number; totalPages: number; currentPage: number };

const initialState: TodosState = {
  todos: [],
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
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
type SetTodosAction = {
  type: TodoActionType.SET_TODOS;
  payload: { todos: Todo[]; totalCount: number; currentPage: number; totalPages: number };
};

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
      const { todos, totalCount, currentPage, totalPages } = action.payload;
      return { ...state, todos, totalCount, currentPage, totalPages };
    }
    default:
      return state;
  }
}
// 3. context 생성
// 만들어진 Context 가 관리하는 value 의 모양
type TodoContextValue = {
  todos: Todo[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, editTitle: string) => void;
  loadTodos: (page: number, limit: number) => void;
};
const TodoConText = createContext<null | TodoContextValue>(null);

// 4. provider 생성
// 1. props 정의하기
// interface TodoProviderProps {
//   children?: React.ReactNode;
//   currentPage?: number;
//   limit?: number;
// }
interface TodoProviderProps extends PropsWithChildren {
  currentPage?: number;
  limit?: number;
}
export const TodoProvider: React.FC<TodoProviderProps> = ({
  children,
  currentPage = 1,
  limit = 10,
}): JSX.Element => {
  // useReducer 로 상태관리
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
  const setTodos = (todos: Todo[], totalCount: number, currentPage: number, totalPages: number) => {
    dispatch({
      type: TodoActionType.SET_TODOS,
      payload: { todos, totalCount, currentPage, totalPages },
    });
  };
  // Supabase 의 목록 읽기 함수 표현식
  // 비동기 데이터베이스 접근
  // const loadTodos = async (): Promise<void> => {
  //   try {
  //     const result = await getTodos();
  //     setTodos(result);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const loadTodos = async (page: number, limit: number): Promise<void> => {
    try {
      const result = await getTodosPaginated(page, limit);
      // 현재 페이지가 비어있고 첫 페이지가 아니라면 이전페이지가 출력됨
      if (result.todos.length === 0 && result.totalPages > 0 && page > 1) {
        const prevPageResult = await getTodosPaginated(page - 1, limit);
        setTodos(
          prevPageResult.todos,
          prevPageResult.totalCount,
          prevPageResult.currentPage,
          prevPageResult.totalPages,
        );
      } else {
        setTodos(result.todos, result.totalCount, result.currentPage, result.totalPages);
      }
    } catch (error) {
      console.log(`목록 가져오기 오류 : ${error}`);
    }
  };

  // 페이지가 바뀌면 다시 실행하도록 해야 한다.
  useEffect(() => {
    loadTodos(currentPage, limit);
  }, [currentPage]);

  // value 전달할 값
  const value: TodoContextValue = {
    todos: state.todos,
    totalCount: state.totalCount,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    itemsPerPage: limit,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    loadTodos,
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
```

### 2.3. 페이지네이션을 위한 컴포넌트 생성

- /src/components/Pagination.tsx 생성 (재활용 할 수 있도록)

```tsx
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  handleChangePage: (page: number) => void;
}
const Pagination = ({
  totalCount,
  totalPages,
  currentPage,
  itemsPerPage,
  handleChangePage,
}: PaginationProps): JSX.Element => {
  // 시작 번호를 생성함.
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  // 마지막 번호를 생성함.
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  // 페이지 번호 버튼 배열을 생성함
  const getPageNumbers = () => {
    const pages = [];
    // 한 화면에 몇개의 버튼들을 출력할 것인가?
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      // 현재 10 페이지 보다 적은 경우
      for (let i = 1; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 10 페이지 보다 많은 경우
      // 시나리오
      // ... currentpage-2 currentpage-1 currentpage currentpage+1 currentpage+2 ...
      // 현재 페이지를 중심으로 앞뒤 2개씩 표현
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      // 시작페이지가 1 보다 크면 첫 페이지와 ... 추가
      if (startPage > 1) {
        pages.push(1);
        // [1]
        if (startPage > 2) {
          pages.push(`...`);
          // [1, "..."]
        }
      }
      // 중간 페이지를 추가
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      // 끝 페이지가 마지막 보다 작으면 ... 과 페이지 추가
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push(`...`);
        }
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // 페이지네이션이 무조건 나오는 것은 아니다.
  if (totalPages <= 1) {
    return <></>;
  }

  return (
    <div>
      {/* 페이지 정보 */}
      <div>
        총 {totalCount}개 중 {startItem} ~ {endItem} 개 표시
      </div>
      {/* 페이지 번호들 */}
      <div>
        <button onClick={() => handleChangePage(currentPage - 1)} disabled={currentPage === 1}>
          이전
        </button>
        {/* 버튼들 출력 */}
        {pageNumbers.map((item, index) => (
          <React.Fragment key={index}>
            {item === '...' ? (
              <span>...</span>
            ) : (
              <button onClick={() => handleChangePage(item as number)}>{item}</button>
            )}
          </React.Fragment>
        ))}
        <button
          onClick={() => handleChangePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default Pagination;
```

### 2.4. /src/pages/TodosPage.tsx

```tsx
import { useEffect, useState } from 'react';
import TodoList from '../components/todos/TodoList';
import TodoWrite from '../components/todos/TodoWrite';
import { TodoProvider, useTodos } from '../contexts/TodoContext';
import type { Profile } from '../types/TodoTypes';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../lib/profile';
import Pagination from '../components/Pagination';

// 컴포넌트
interface TodosContentProps {
  currentPage: number;
  itemsPerPage: number;
  handleChangePage: (page: number) => void;
}
const TodosContent = ({ currentPage, itemsPerPage, handleChangePage }: TodosContentProps) => {
  const { totalCount, totalPages } = useTodos();
  return (
    <div>
      <div>
        {/* 새 글 등록시 1페이지로 이동후 목록 새로고침 */}
        <TodoWrite handleChangePage={handleChangePage} />
      </div>
      <div>
        <TodoList />
      </div>
      <div>
        <Pagination
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          handleChangePage={handleChangePage}
        />
      </div>
    </div>
  );
};

function TodosPage() {
  const { user } = useAuth();
  // 페이지네이션 관련
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // const itemsPerPage = 10;
  // 페이지 변경 핸들러
  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const [profile, setProfile] = useState<Profile | null>(null);

  // 프로필 가져오기
  const loadProfile = async () => {
    try {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        if (!userProfile) {
          alert('탈퇴한 회원입니다. 관리자에게 요청하세요.');
        }
        setProfile(userProfile);
      }
    } catch (error) {
      console.log('프로필 가져오기 Error : ', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div>
      <h2>{profile?.nickname}할일</h2>
      <TodoProvider currentPage={currentPage} limit={itemsPerPage}>
        <TodosContent
          handleChangePage={handleChangePage}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
      </TodoProvider>
    </div>
  );
}

export default TodosPage;
```
