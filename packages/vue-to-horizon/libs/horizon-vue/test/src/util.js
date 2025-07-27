// 测试工具函数需要添加这些依赖
import { parse } from '@babel/parser';
import generate from '@babel/generator';

/**
 * 将转换后的 AST 转换为规范化代码字符串
 * @param {object} templateAst - 转换后的 JSX AST
 * @returns {string} 标准化的代码字符串
 */
export function generateReactCode(templateAst) {
  const { code } = generate(templateAst, {
    jsescOption: { minimal: true },
    retainLines: true,
  });

  return (
    code
      .replace(/\s+/g, ' ')
      // 处理等号后左大括号前的空格，如 = { 转为 ={
      .replace(/=\s*{/g, '={')
      // 去除左大括号后的空格
      .replace(/{\s+/g, '{')
      // 去除右大括号前的空格
      .replace(/\s+}/g, '}')
      // 移除语句结尾分号
      .replace(/;\s*/g, '')
      .trim()
  );
}
