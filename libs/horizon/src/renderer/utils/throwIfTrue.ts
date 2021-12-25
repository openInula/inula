// 当条件不成立报错
// 接收模板
export function throwIfTrue(condition: boolean, errTemplate: string, ...errExpressions: string[]) {
  if (condition) {
    // 将%s 替换成对应的变量
    const msg = errTemplate.split('%s').reduce((prevSentence: string, part: string, idx: number) => {
      // %s对应的变量
      const expression = idx < errExpressions.length ? errExpressions[idx] : '' ;
      return prevSentence + part + expression;
    }, '');
    throw Error(msg);
  }
}
