import { RiEditLine, RiImageLine, RiLock2Line } from 'react-icons/ri';
import { ButtonFillMd, GrayButtonFillSm } from '../../ui/button';
import { UserFill } from '../../ui/Icon';
import { useState } from 'react';
function SettingsPage() {
  const [settings, setSettings] = useState({ sms: false, newLogin: false });
  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <div>
      {' '}
      <div>
        {' '}
        <div>
          {' '}
          {/* 파트너 프로필 이미지 사진 */}{' '}
          <div>
            {' '}
            <UserFill />{' '}
          </div>{' '}
          <div>
            {' '}
            {/* 파트너 닉네임 */} <p>도롱</p> {/* 파트너 아이디 */} <p>ehfhd123</p>{' '}
          </div>{' '}
          {/* 클릭시 사진등록 후 바로 변경 */}{' '}
          <ButtonFillMd>
            {' '}
            <RiImageLine /> <p>사진 변경</p>{' '}
          </ButtonFillMd>{' '}
        </div>{' '}
        <div>
          {' '}
          <p>개인 정보</p>{' '}
          <div>
            {' '}
            <div>
              {' '}
              <div>
                {' '}
                <p>이름</p> {/* 파트너 이름 */} <p>도현</p>{' '}
              </div>{' '}
              <div>
                {' '}
                <p>전화번호</p> {/* 파트너 전화번호 */} <p>010-1234-5678</p>{' '}
              </div>{' '}
            </div>{' '}
            <div>
              {' '}
              <div>
                {' '}
                <p>이메일</p> {/* 파트너 이메일 */} <p>ehfhd123@naver.com</p>{' '}
              </div>{' '}
              <div>
                {' '}
                <p>사업장 등록번호</p> <p>123-45-67890</p>{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
      <div>
        {' '}
        <div>
          {' '}
          <div>
            {' '}
            <p>비밀번호</p> {/* 클릭시 비밀번호 변경 모달 */}{' '}
            <GrayButtonFillSm>
              {' '}
              <RiLock2Line /> <p>비밀번호 변경</p>{' '}
            </GrayButtonFillSm>{' '}
          </div>{' '}
          <div>
            {' '}
            <p>비밀번호 변경</p> {/* 비밀번호 마지막 변경일자 */}{' '}
            <p>마지막 변경일 : 2025년 8월 29일</p>{' '}
          </div>{' '}
        </div>{' '}
        <div>
          {' '}
          <p>사업자 정보</p>{' '}
          <div>
            {' '}
            <p>사업자 명</p> {/* 파트너 매장 명 */} <p>도롱의 피자가게</p>{' '}
          </div>{' '}
          <div>
            {' '}
            <p>사업장 주소</p> {/* 파트너 매장 주소 */} <p>대구광역시 동성로 123길 56</p>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
      <div>
        {' '}
        <div>
          {' '}
          <p>연결된 소셜 이메일</p>{' '}
          <div>
            {' '}
            <p>카카오 이메일</p> {/* 파트너 카카오 이메일 */} <p>ehfhd123@kakao.com</p>{' '}
          </div>{' '}
          <div>
            {' '}
            <p>구글 이메일</p> {/* 파트너 구글 이메일 */} <p>등록된 구글 이메일이 없습니다.</p>{' '}
          </div>{' '}
        </div>{' '}
        <div>
          {' '}
          <p>2단계 인증</p>{' '}
          <div>
            {' '}
            <div>
              {' '}
              <p>SMS 인증</p> <p>로그인 시 SMS 로 인증코드를 받습니다.</p>{' '}
            </div>{' '}
            <div>
              {' '}
              <button
                type="button"
                onClick={() => handleToggle('sms')}
                className={[
                  'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                  settings.sms ? 'bg-[#FF5722]' : 'bg-gray-300',
                ].join(' ')}
              >
                {' '}
                <span
                  className={[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.sms ? 'translate-x-[18px]' : 'translate-x-[2px]',
                  ].join(' ')}
                />{' '}
              </button>{' '}
            </div>{' '}
          </div>{' '}
          <div>
            {' '}
            <div>
              {' '}
              <p>로그인 알림</p> <p>새로운 기기에서 로그인 시 알림을 받습니다.</p>{' '}
            </div>{' '}
            <div>
              {' '}
              <button
                type="button"
                onClick={() => handleToggle('newLogin')}
                className={[
                  'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                  settings.newLogin ? 'bg-[#FF5722]' : 'bg-gray-300',
                ].join(' ')}
              >
                {' '}
                <span
                  className={[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.newLogin ? 'translate-x-[18px]' : 'translate-x-[2px]',
                  ].join(' ')}
                />{' '}
              </button>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
}
