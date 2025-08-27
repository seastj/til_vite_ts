import React from 'react';
import { useShop } from './ShopContext';

const Cart = () => {
  const { balance, cart, removeCartOne, resetCart, clearCart, buyAll } = useShop();
  return (
    <div>
      <h2>장바구니</h2>
      <ul>
        {cart.map(item => (
          <li key={item.id}>
            <span>제품명:</span>
            <span>담은갯수 : {item.qty}</span>
            <button onClick={() => removeCartOne(item.id)}>줄이기</button>
            <button onClick={() => clearCart(item.id)}>제품삭제</button>
          </li>
        ))}
      </ul>
      <button onClick={buyAll}>전체 구매하기</button>
      <button onClick={resetCart}>전체 삭제하기</button>
    </div>
  );
};

export default Cart;
