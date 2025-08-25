type SampleProps = {
  age: number;
  nickName: string;
  children?: React.ReactNode;
};

const Sample = ({ age, nickName }: SampleProps) => {
  return (
    <div>
      {age}살 이고요. 별명이 {nickName} 인 샘플입니다.
    </div>
  );
};

const App = () => {
  return (
    <div>
      <h1>App</h1>
      <Sample age={20} nickName="홍길동" />
    </div>
  );
};

export default App;
