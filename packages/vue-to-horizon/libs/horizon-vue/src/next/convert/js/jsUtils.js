/**
 * 解析函数（ref, reactive 等）的变量名称和初始值
 * const t = ref('a')
 * -->  ['t', 'a']
 * @param {*} pathsub
 * @returns
 */
export function findCallVariableAndValue(pathsub) {
  let declaratorPath = pathsub.findParent(p => p.isVariableDeclarator());
  let varName = declaratorPath.node.id.name;
  let iniValue = null;
  if (pathsub.node.arguments && pathsub.node.arguments.length > 0) {
    // ast-types 可以用来生成值的源代码表示，
    // 但为了简洁，这里我们只记录值的类型
    let arg = pathsub.node.arguments[0];
    iniValue = {
      type: arg.type,
      // 你可以根据 AST 节点类型扩展这个结构以捕获更多信息
      value: arg.type === 'StringLiteral' ? arg.value : 'complex',
    };
  }
  return [varName, iniValue];
}

/**
 * 检查函数（ref, reactive 等）对应的变量赋值   const xx = func(..)
 * @param {*} path
 * @returns
 */
export function checkCallVariable(path) {
  return (
    path.parent.type === 'VariableDeclarator' && // 确保这是一个变量声明
    path.parent.id && // 确保有声明的变量名
    path.parent.id.type === 'Identifier'
  ); // 确保声明的变量名是标识符
}

/**
 * 判断是不是小写字母开头
 * @param {*} str
 * @returns
 */
export function startsWithLowerCase(str) {
  return /^[a-z]/.test(str);
}

/**
 * 将首字母大写
 * @param {*} str
 * @returns
 */
export function capitalizeFirstLetter(str) {
  if (str.length === 0) return str; // 如果字符串为空，直接返回
  const firstChar = str.charAt(0);
  if (firstChar >= 'a' && firstChar <= 'z') {
    // 首字母是小写字母
    return firstChar.toUpperCase() + str.slice(1);
  }
  // 首字母不是小写字母，直接返回原字符串
  return str;
}
