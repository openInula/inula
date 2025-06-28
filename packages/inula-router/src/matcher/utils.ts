/**
 * @description 将url中的//转换为/
 */
export function cleanPath(path: string): string {
  return path.replace(/\/+/g, '/');
}

export function scoreCompare(score1: number[], score2: number[]): number {
  const score1Length = score1.length;
  const score2Length = score2.length;
  const end = Math.min(score1Length, score2Length);
  for (let i = 0; i < end; i++) {
    const delta = score2[i] - score1[i];
    if (delta !== 0) {
      return delta;
    }
  }
  if (score1Length === score2Length) {
    return 0;
  }
  return score1Length > score2Length ? -1 : 1;
}

// 把正则表达式的特殊符号加两个反斜杠进行转义
export function escapeStr(str: string) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
}
