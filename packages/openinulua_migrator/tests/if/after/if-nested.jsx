function ProductDisplay({ product, user }) {
  return (
    <div>
      <if cond={product}>
        <if cond={user?.isAdmin}>
          <button>编辑商品</button>
        </if>
        <else-if cond={user?.canPurchase}>
          <button>购买</button>
        </else-if>
        <else>
          <p>请登录后购买</p>
        </else>
      </if>
      <else>
        <p>商品不存在</p>
      </else>
    </div>
  );
}


