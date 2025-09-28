function Card({ title, info, ...rest }) {
  return <div id="card" className={info?.cls} {...rest}>{title}</div>;
}
/*
TS-CLI 内部错误
问题：TS-CLI 在处理 JSX 属性展开（{...rest}）时出现内部错误
错误信息：TypeError: Property name expected type of string but got undefined
位置：TS-CLI 内部的 setHTMLSpread 函数
原因：这是 TS-CLI 的一个 bug，不是我们的 Rust 编译器的问题
验证：通过创建简化的测试用例确认了这个问题
*/


