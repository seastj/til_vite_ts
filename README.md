# Context API 와 useReducer 예제

- 시나리오
  - 쇼핑몰 장바구니, 잔액 관리

## 1. 폴더 및 파일 구조

- /src/contexts/shop 폴더 생성
- /src/contexts/shop/ShopContext.tsx 파일 생성

```tsx
import React, { createContext, useContext, useReducer } from 'react';

// 1. 초기값
type CartType = { id: number; qty: number };
type GoodType = {
  id: number;
  name: string;
  price: number;
};
type ShopStateType = {
  balance: number;
  cart: CartType[];
  goods: GoodType[];
};
const initialState: ShopStateType = {
  balance: 100000,
  cart: [],
  goods: [
    { id: 1, name: '사과', price: 1000 },
    { id: 2, name: '딸기', price: 30000 },
    { id: 3, name: '바나나', price: 500 },
    { id: 4, name: '초콜릿', price: 8000 },
  ],
};
// 2. 리듀서
enum ShopActionType {
  ADD_CART = 'ADD_CART',
  REMOVE_CART_ONE = 'REMOVE_CART_ONE',
  CLEAR_CART_ITEM = 'CLEAR_CART_ITEM',
  BUY_ALL = 'BUY_ALL',
  RESET = 'RESET',
}
type ShopActionAddCart = { type: ShopActionType.ADD_CART; payload: { id: number } };
type ShopActionRemoveCart = { type: ShopActionType.REMOVE_CART_ONE; payload: { id: number } };
type ShopActionClearCart = { type: ShopActionType.CLEAR_CART_ITEM; payload: { id: number } };
type ShopActionBuyAll = { type: ShopActionType.BUY_ALL };
type ShopActionReset = { type: ShopActionType.RESET };
type ShopAction =
  | ShopActionAddCart
  | ShopActionRemoveCart
  | ShopActionClearCart
  | ShopActionBuyAll
  | ShopActionReset;

// 장바구니 전체 계산하기
// 장바구니 전체 금액 계산하기

// 총액 계산 함수 (state 대신 cart, goods만 받도록)
function calcTotal(cart: CartType[], goods: GoodType[]): number {
  return cart.reduce((sum, c) => {
    const good = goods.find(g => g.id === c.id);
    return good ? sum + good.price * c.qty : sum;
  }, 0);
}

function reducer(state: ShopStateType, action: ShopAction) {
  switch (action.type) {
    case ShopActionType.ADD_CART: {
      const { id } = action.payload; // 제품의 ID
      // id 제품이 배열에 있는가? qty 가 있는가?
      const existGood = state.cart.find(item => item.id === id);
      let arr: CartType[] = [];
      if (existGood) {
        // qty 증가
        arr = state.cart.map(item => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      } else {
        // state.cart 에 새 제품 추가, qty 는 1개
        arr = [...state.cart, { id: id, qty: 1 }];
      }
      return { ...state, cart: arr };
    }
    case ShopActionType.REMOVE_CART_ONE: {
      const { id } = action.payload;
      const existGood = state.cart.find(item => item.id === id);
      if (!existGood) {
        // 제품이 없다면?
        return state;
      }
      let arr: CartType[] = [];
      if (existGood.qty > 1) {
        // 제품이 최소 2개 이상이면
        arr = state.cart.map(item => (item.id === id ? { ...item, qty: item.qty - 1 } : item));
      } else {
        // 제품이 1개 담겼다.
        arr = state.cart.filter(item => item.id !== id);
      }
      return { ...state, cart: arr };
    }
    case ShopActionType.CLEAR_CART_ITEM: {
      // 담겨진 제품 중에 장바구니에서 제거하기
      const { id } = action.payload;
      const arr = state.cart.filter(item => item.id !== id);
      return { ...state, cart: arr };
    }
    case ShopActionType.BUY_ALL: {
      // 총 금액 계산
      const total = calcTotal(state.cart, state.goods);
      if (total > state.balance) {
        alert('돈이 부족합니다.');
        return state;
      }
      return { ...state, balance: state.balance - total, cart: [] };
    }
    case ShopActionType.RESET: {
      return initialState;
    }
    default:
      return state;
  }
}
// 3. 컨텍스트 생성
type ShopValueType = {
  cart: CartType[];
  goods: GoodType[];
  balance: number;
  addCart: (id: number) => void;
  removeCartOne: (id: number) => void;
  clearCart: (id: number) => void;
  resetCart: () => void;
  buyAll: () => void;
};
const ShopContext = createContext<null | ShopValueType>(null);
// 4. 프로바이더
export const ShopProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch 용 함수 표현식
  const addCart = (id: number) => {
    dispatch({ type: ShopActionType.ADD_CART, payload: { id } });
  };
  const removeCartOne = (id: number) => {
    dispatch({ type: ShopActionType.REMOVE_CART_ONE, payload: { id } });
  };
  const clearCart = (id: number) => {
    dispatch({ type: ShopActionType.CLEAR_CART_ITEM, payload: { id } });
  };
  const resetCart = () => {
    dispatch({ type: ShopActionType.RESET });
  };
  const buyAll = () => {
    dispatch({ type: ShopActionType.BUY_ALL });
  };

  const value: ShopValueType = {
    cart: state.cart,
    goods: state.goods,
    balance: state.balance,
    addCart,
    removeCartOne,
    clearCart,
    resetCart,
    buyAll,
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
// 5. 커스텀 훅
export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('컨텍스트가 생성되지않았습니다.');
  }
  return ctx;
}
// 6. 추가 커스텀 훅 : 상품 찾기, 총액
export function useShopSelectors() {
  const { goods, cart } = useShop();
  // 제품 한개 정보 찾기
  const getGood = (id: number) => goods.find(item => item.id);
  // 총 금액
  const total = calcTotal(cart, goods);
  // 리턴
  return { getGood, total };
}
```

- /src/components/shop/Cart.tsx 파일 생성

```tsx
import React from 'react';
import { useShop, useShopSelectors } from './ShopContext';

const Cart = () => {
  const { balance, addCart, cart, removeCartOne, resetCart, clearCart, buyAll } = useShop();
  const { getGood, total } = useShopSelectors();
  const box: React.CSSProperties = {
    border: '2px solid #eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    background: '#fff',
  };
  const boxrow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px dashed #eee',
  };

  return (
    <div style={box}>
      <h2>장바구니</h2>
      {cart.length === 0 ? (
        <p>장바구니가 비었습니다.</p>
      ) : (
        <ul>
          {cart.map(item => {
            // 제품 찾기
            const good = getGood(item.id);

            return (
              <li key={item.id} style={boxrow}>
                <div>
                  <strong>{good?.name}</strong> X {item.qty}
                  <div>
                    {good?.price.toLocaleString()} X {item.qty} ={' '}
                    {(good!.price * item.qty).toLocaleString()} 원
                  </div>
                </div>
                <span>제품명 : </span>
                <span>담은갯수 : {item.qty}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => addCart(item.id)}>➕</button>
                  <button onClick={() => removeCartOne(item.id)}>➖</button>
                  <button onClick={() => clearCart(item.id)}>제품삭제</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>총액</strong>
        <strong>{total.toLocaleString()} 원</strong>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={buyAll}>전체 구매하기</button>
        <button onClick={resetCart}>전체 삭제하기</button>
      </div>
    </div>
  );
};

export default Cart;
```

- /src/components/shop/Wallet.tsx 파일 생성

```tsx
import React from 'react';
import { useShop } from './ShopContext';

const Wallet = () => {
  const { balance } = useShop();

  const box: React.CSSProperties = {
    border: '2px soild #eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    background: '#fff',
  };
  return (
    <div style={box}>
      <h2>💰 내 지갑</h2>
      <div style={{ fontSize: 50 }}>
        <strong>💲 {balance.toLocaleString()} 원</strong>
      </div>
      <p style={{ marginTop: 8, color: '#666' }}> 장바구니에 담긴 제품을 구매하면 여기서 빠져요</p>
    </div>
  );
};

export default Wallet;
```

- App.tsx 수정

```tsx
import React from 'react';
import GoodList from './components/shop/GoodList';
import Cart from './components/shop/Cart';
import Wallet from './components/shop/Wallet';
import { ShopProvider } from './components/shop/ShopContext';

const page: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: 24,
  background: '#eee',
};
const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplate: '1fr 320px',
  gap: 20,
  alignItems: 'start',
};
function App() {
  return (
    <div style={page}>
      <h1>📠나의 가게</h1>
      <ShopProvider>
        <div style={grid}>
          <div>
            <GoodList />
            <Cart />
          </div>
          <div>
            <Wallet />
          </div>
        </div>
      </ShopProvider>
    </div>
  );
}

export default App;
```

## 2. 실전 파일 분리하기

### 2.1. 폴더 및 파일 구조

- 기능별로 분리한다면 contexts 말고 `features` 폴더로
- `/src/features` 폴더 생성
- `/src/features/shop` 폴더 생성
- /src/features/shop/types.ts 파일 생성

```ts
// 장바구니 아이템 타입
export type CartType = { id: number; qty: number };
// 제품 아이템 타입
export type GoodType = {
  id: number;
  name: string;
  price: number;
};
// ShopState 타입
export type ShopStateType = {
  balance: number;
  cart: CartType[];
  goods: GoodType[];
};
// Action 타입
export enum ShopActionType {
  ADD_CART = 'ADD_CART',
  REMOVE_CART_ONE = 'REMOVE_CART_ONE',
  CLEAR_CART_ITEM = 'CLEAR_CART_ITEM',
  BUY_ALL = 'BUY_ALL',
  RESET = 'RESET',
}
export type ShopActionAddCart = { type: ShopActionType.ADD_CART; payload: { id: number } };
export type ShopActionRemoveCart = {
  type: ShopActionType.REMOVE_CART_ONE;
  payload: { id: number };
};
export type ShopActionClearCart = { type: ShopActionType.CLEAR_CART_ITEM; payload: { id: number } };
export type ShopActionBuyAll = { type: ShopActionType.BUY_ALL };
export type ShopActionReset = { type: ShopActionType.RESET };
export type ShopAction =
  | ShopActionAddCart
  | ShopActionRemoveCart
  | ShopActionClearCart
  | ShopActionBuyAll
  | ShopActionReset;
// Context 의 Value 타입
export type ShopValueType = {
  cart: CartType[];
  goods: GoodType[];
  balance: number;
  addCart: (id: number) => void;
  removeCartOne: (id: number) => void;
  clearCart: (id: number) => void;
  resetCart: () => void;
  buyAll: () => void;
};
```

- /src/features/shop/state.ts 파일 생성

```ts
import type { ShopStateType } from './types';

export const initialState: ShopStateType = {
  balance: 100000,
  cart: [],
  goods: [
    { id: 1, name: '🍎', price: 1000 },
    { id: 2, name: '🍓', price: 30000 },
    { id: 3, name: '🍌', price: 500 },
    { id: 4, name: '🍫', price: 8000 },
  ],
};
```

- /src/features/shop/utils.ts 파일 생성

```ts
import type { CartType, GoodType } from './types';

// 총액 계산 함수 (state 대신 cart, goods만 받도록)
export function calcTotal(cart: CartType[], goods: GoodType[]): number {
  return cart.reduce((sum, c) => {
    const good = goods.find(g => g.id === c.id);
    return good ? sum + good.price * c.qty : sum;
  }, 0);
}
```

- /src/features/shop/reducer.ts 파일 생성

```ts
import { initialState } from './state';
import type { CartType, ShopAction, ShopStateType } from './types';
import { ShopActionType } from './types';
import { calcTotal } from './utils';

export function reducer(state: ShopStateType, action: ShopAction) {
  switch (action.type) {
    case ShopActionType.ADD_CART: {
      const { id } = action.payload; // 제품의 ID
      // id 제품이 배열에 있는가? qty 가 있는가?
      const existGood = state.cart.find(item => item.id === id);
      let arr: CartType[] = [];
      if (existGood) {
        // qty 증가
        arr = state.cart.map(item => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      } else {
        // state.cart 에 새 제품 추가, qty 는 1개
        arr = [...state.cart, { id: id, qty: 1 }];
      }
      return { ...state, cart: arr };
    }
    case ShopActionType.REMOVE_CART_ONE: {
      const { id } = action.payload;
      const existGood = state.cart.find(item => item.id === id);
      if (!existGood) {
        // 제품이 없다면?
        return state;
      }
      let arr: CartType[] = [];
      if (existGood.qty > 1) {
        // 제품이 최소 2개 이상이면
        arr = state.cart.map(item => (item.id === id ? { ...item, qty: item.qty - 1 } : item));
      } else {
        // 제품이 1개 담겼다.
        arr = state.cart.filter(item => item.id !== id);
      }
      return { ...state, cart: arr };
    }
    case ShopActionType.CLEAR_CART_ITEM: {
      // 담겨진 제품 중에 장바구니에서 제거하기
      const { id } = action.payload;
      const arr = state.cart.filter(item => item.id !== id);
      return { ...state, cart: arr };
    }
    case ShopActionType.BUY_ALL: {
      // 총 금액 계산
      const total = calcTotal(state.cart, state.goods);
      if (total > state.balance) {
        alert('돈이 부족합니다.');
        return state;
      }
      return { ...state, balance: state.balance - total, cart: [] };
    }
    case ShopActionType.RESET: {
      return initialState;
    }
    default:
      return state;
  }
}
```

- /src/features/shop/ShopContext.tsx 파일 생성

```ts
import React, { createContext, useReducer } from 'react';
import { reducer } from './reducer';
import { initialState } from './state';
import { ShopActionType, type ShopValueType } from './types';

export const ShopContext = createContext<null | ShopValueType>(null);
export const ShopProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch 용 함수 표현식
  const addCart = (id: number) => {
    dispatch({ type: ShopActionType.ADD_CART, payload: { id } });
  };
  const removeCartOne = (id: number) => {
    dispatch({ type: ShopActionType.REMOVE_CART_ONE, payload: { id } });
  };
  const clearCart = (id: number) => {
    dispatch({ type: ShopActionType.CLEAR_CART_ITEM, payload: { id } });
  };
  const resetCart = () => {
    dispatch({ type: ShopActionType.RESET });
  };
  const buyAll = () => {
    dispatch({ type: ShopActionType.BUY_ALL });
  };

  const value: ShopValueType = {
    cart: state.cart,
    goods: state.goods,
    balance: state.balance,
    addCart,
    removeCartOne,
    clearCart,
    resetCart,
    buyAll,
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

```

- `/src/features/shop/hooks` 폴더 생성
- /src/features/shop/hooks/useShop.ts 파일 생성

```ts
import { useContext } from 'react';
import { ShopContext } from '../ShopContext';

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('컨텍스트가 생성되지않았습니다.');
  }
  return ctx;
}
```

- /src/features/shop/hooks/useShopSelectors.ts 파일 생성

```ts
import { calcTotal } from '../utils';
import { useShop } from './useShop';

export function useShopSelectors() {
  const { goods, cart } = useShop();
  // 제품 한개 정보 찾기
  const getGood = (id: number) => goods.find(item => item.id);
  // 총 금액
  const total = calcTotal(cart, goods);
  // 리턴
  return { getGood, total };
}
```

### 2.2. `배럴(Barrel) 파일` 활용하기

- 여러 모듈에서 내보낸 것들을 모아서 하나의 파일에서 다시 내보내는 패턴
- 주로 `index.js` 나 `index.ts` 로 파일명을 정한다.
- 위의 내용을 `대표 파일`이라고 한다.
- `/src/features/shop/index.ts` 파일 생성

```ts
export * from './types';
// 아래의 경우는 충돌 발생 소지 있음
export { initialState } from './state';
export { calcTotal } from './utils';
// 아래의 경우는 충돌 발생 소지 있음
export { reducer } from './reducer';
export { ShopContext, ShopProvider } from './ShopContext';
export { useShop } from './hooks/useShop';
export { useShopSelectors } from './hooks/useShopSelectors';
```

- App.tsx

```tsx
import React from 'react';
import GoodList from './components/shop/GoodList';
import Cart from './components/shop/Cart';
import Wallet from './components/shop/Wallet';
import { ShopProvider } from './features/shop';

const page: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: 24,
  background: '#eee',
};
const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 320px',
  gap: 20,
  alignItems: 'start',
};
function App() {
  return (
    <div style={page}>
      <h1>📠나의 가게</h1>
      <ShopProvider>
        <div style={grid}>
          <div>
            <GoodList />
            <Cart />
          </div>
          <div>
            <Wallet />
          </div>
        </div>
      </ShopProvider>
    </div>
  );
}

export default App;
```

- GoodList.tsx

```tsx
import React from 'react';
import { useShop } from '../../features/shop';

const GoodList = () => {
  const box: React.CSSProperties = {
    border: '2px solid #eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    background: '#fff',
  };
  const boxrow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  };

  const { goods, addCart } = useShop();
  return (
    <div style={box}>
      <h2>🍥GoodList</h2>
      <ul style={{ padding: 0, margin: 0 }}>
        {goods.map(item => (
          <li key={item.id} style={boxrow}>
            <span>
              <strong>{item.name}</strong> {item.price} 원
            </span>
            <button onClick={() => addCart(item.id)}>담기</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoodList;
```

- Cart.tsx

```tsx
import React from 'react';
import { useShop, useShopSelectors } from '../../features/shop';

const Cart = () => {
  const { balance, addCart, cart, removeCartOne, resetCart, clearCart, buyAll } = useShop();
  const { getGood, total } = useShopSelectors();
  const box: React.CSSProperties = {
    border: '2px solid #eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    background: '#fff',
  };
  const boxrow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px dashed #eee',
  };

  return (
    <div style={box}>
      <h2>장바구니</h2>
      {cart.length === 0 ? (
        <p>장바구니가 비었습니다.</p>
      ) : (
        <ul>
          {cart.map(item => {
            // 제품 찾기
            const good = getGood(item.id);
            return (
              <li key={item.id} style={boxrow}>
                <div>
                  <strong>{good?.name}</strong> X {item.qty}
                  <div>
                    {good?.price.toLocaleString()} X {item.qty} =
                    {(good!.price * item.qty).toLocaleString()} 원
                  </div>
                </div>
                <span>제품명 : </span>
                <span>담은갯수 : {item.qty}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => addCart(item.id)}>➕</button>
                  <button onClick={() => removeCartOne(item.id)}>➖</button>
                  <button onClick={() => clearCart(item.id)}>제품삭제</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>총액</strong>
        <strong>{total.toLocaleString()} 원</strong>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={buyAll}>전체 구매하기</button>
        <button onClick={resetCart}>전체 삭제하기</button>
      </div>
    </div>
  );
};

export default Cart;
```

- Wallet.tsx

```tsx
import React from 'react';
import { useShop } from '../../features/shop';

const Wallet = () => {
  const { balance } = useShop();

  const box: React.CSSProperties = {
    border: '2px soild #eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    background: '#fff',
  };
  return (
    <div style={box}>
      <h2>💰 내 지갑</h2>
      <div style={{ fontSize: 50 }}>
        <strong>💲 {balance.toLocaleString()} 원</strong>
      </div>
      <p style={{ marginTop: 8, color: '#666' }}> 장바구니에 담긴 제품을 구매하면 여기서 빠져요</p>
    </div>
  );
};

export default Wallet;
```
