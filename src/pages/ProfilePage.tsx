/**
 * 사용자 프로필 페이지
 * - 기본 정보 표시
 * - 정보 수정
 * - 회원 탈퇴 기능 : 확인을 거치고 진행하도록
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../lib/profile';
import type { Profile, ProfileUpdate } from '../types/TodoTypes';

function ProfilePage() {
  // 회원 기본 정보
  const { user, deleteAccount } = useAuth();
  // 데이터 가져오는 동안 로딩한다.
  const [loading, setLoading] = useState<boolean>(true);
  // 사용자 프로필
  const [profileData, setProfileData] = useState<Profile | null>(null);
  // 에러 메시지
  const [error, setError] = useState<string>('');
  // 회원 정보 수정
  const [edit, setEdit] = useState<boolean>(false);
  // 회원 닉네임 보관
  const [nickName, setNickName] = useState<string>('');

  // 사용자 프로필 정보 가져오기
  const loadProfile = async () => {
    if (!user?.id) {
      // 사용자의 id 가 없으면 중지
      setError('사용자 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }
    try {
      // 사용자 정보 가져오기 ( null 일수도 있다. )
      const tempData = await getProfile(user?.id);
      if (!tempData) {
        // null 이라면
        setError('사용자 프로필 정보를 찾을 수 없습니다.');
        return;
      }
      // 사용자 정보가 있다.
      setNickName(tempData.nickname || '');
      setProfileData(tempData);
    } catch (err) {
      console.log(err);
      setError('사용자 프로필 호출 오류');
    } finally {
      setLoading(false);
    }
  };
  // 프로필 데이터 업데이트
  const saveProfile = async () => {
    if (!user) {
      return;
    }
    if (!profileData) {
      return;
    }
    try {
      const tempUpdateData: ProfileUpdate = { nickname: nickName };
      const success = await updateProfile(tempUpdateData, user.id);
      if (!success) {
        console.log('프로필 업데이트에 실패했습니다.');
        return;
      }
      loadProfile();
    } catch (err) {
      console.log('프로필 업데이트 오류', err);
    } finally {
      setEdit(false);
    }
  };

  // 회원탈퇴
  const handleDeleteUser = () => {
    const message: string = '🚫 계정을 완전히 삭제하시겠습니까? \n\n 복구가 불가능합니다.';
    let isConfirm = false;
    isConfirm = confirm(message);

    if (isConfirm) {
      deleteAccount();
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);
  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          zIndex: 99,
          background: 'green',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1>프로필 로딩중 ...</h1>
      </div>
    );
  }
  // error 메시지 출력하기
  if (error) {
    return (
      <div>
        <h2>프로필</h2>
        <div>{error}</div>
        <button onClick={loadProfile}>재시도</button>
      </div>
    );
  }

  return (
    <div>
      <h2>회원정보</h2>
      {/* 사용자 기본 정보 섹션 */}
      <div>
        <h3>기본 정보</h3>
        <div>이메일 : {user?.email}</div>
        <div>가입일 : {user?.created_at && new Date(user.created_at).toLocaleString()}</div>
      </div>
      {/* 사용자 추가정보 */}
      <div>
        <h3>사용자 추가 정보</h3>
        <div>아이디 :{profileData?.id}</div>
        {edit ? (
          <>
            <div>
              닉네임 :
              <input type="text" value={nickName} onChange={e => setNickName(e.target.value)} />
            </div>
            <div>
              아바타 편집중 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} />
              ) : (
                <button>파일추가</button>
              )}
            </div>
          </>
        ) : (
          <>
            <div>닉네임 :{profileData?.nickname}</div>
            <div>
              아바타 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} />
              ) : (
                <img
                  src={
                    'https://tse3.mm.bing.net/th/id/OIP.YAcO2InfMIy-gCU-jDazowHaHa?r=0&w=474&h=474&c=7&p=0'
                  }
                  width={60}
                  height={60}
                />
              )}
            </div>
          </>
        )}
        <div>
          가입일 : {profileData?.created_at && new Date(profileData.created_at).toLocaleString()}
        </div>
      </div>
      <div>
        {edit ? (
          <>
            <button onClick={saveProfile}>수정하기</button>
            <button
              onClick={() => {
                setEdit(false);
                setNickName(profileData?.nickname || '');
              }}
            >
              취소
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEdit(true)}>정보수정</button>
            <button onClick={handleDeleteUser}>회원탈퇴</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
