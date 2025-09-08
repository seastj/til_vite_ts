import { useEffect, useState } from 'react';
import TodoList from '../components/todos/TodoList';
import TodoWrite from '../components/todos/TodoWrite';
import { TodoProvider } from '../contexts/TodoContext';
import type { Profile } from '../types/TodoTypes';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../lib/profile';

function TodosPage() {
  const { user } = useAuth();
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
      <TodoProvider>
        <div>
          <TodoWrite />
        </div>
        <div>
          <TodoList />
        </div>
      </TodoProvider>
    </div>
  );
}

export default TodosPage;
