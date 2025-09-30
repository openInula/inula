function ProductDisplay({ product, user }) {
  return (
    <div>
      {product ? (
        user?.isAdmin ? (
          <button>编辑商品</button>
        ) : user?.canPurchase ? (
          <button>购买</button>
        ) : (
          <p>请登录后购买</p>
        )
      ) : (
        <p>商品不存在</p>
      )}
    </div>
  );
}


