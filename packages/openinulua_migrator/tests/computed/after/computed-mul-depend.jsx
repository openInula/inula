function PriceCalculator() {
    let price = 100;
    let quantity = 2;
    const total = price * quantity;
  
    return (
      <div>
        <p>单价：{price}</p>
        <p>数量：{quantity}</p>
        <p>总价：{total}</p>
        <button onClick={() => quantity++}>增加数量</button>
      </div>
    );
  }