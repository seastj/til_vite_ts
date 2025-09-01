import React from 'react';

function HomePage() {
  const box: React.CSSProperties = {
    padding: 16,
    border: '1px solid #000',
    borderRadius: 12,
    background: 'fafafa',
    marginTop: 12,
    textAlign: 'center',
  };
  return (
    <div>
      <div style={box}>
        <h2>환영합니다</h2>
        <p>이곳은 홈 화면 입니다. 상단 메뉴에서 쇼핑을 해주세요</p>
      </div>
    </div>
  );
}

export default HomePage;
