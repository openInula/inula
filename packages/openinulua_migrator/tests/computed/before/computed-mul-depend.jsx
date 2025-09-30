import { useState } from "react";

function PriceCalculator() {
  const [price] = useState(100);   // 假设单价固定
  const [quantity, setQuantity] = useState(2);

  const total = price * quantity;

  return (
    <div>
      <p>单价：{price}</p>
      <p>数量：{quantity}</p>
      <p>总价：{total}</p>
      <button onClick={() => setQuantity(prev => prev + 1)}>
        增加数量
      </button>
    </div>
  );
}

export default PriceCalculator;
