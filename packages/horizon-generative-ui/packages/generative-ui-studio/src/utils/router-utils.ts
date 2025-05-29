import { useLocation, matchPath } from 'react-router-dom';

// Equivalent to Next.js usePathname()
export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

// Equivalent to Next.js useSearchParams()
export function useSearchParams() {
  const location = useLocation();
  return new URLSearchParams(location.search);
}

// Custom hook to get the current path segment
export function useSelectedSegment() {
  const location = useLocation();

  // Extract the first segment after the leading slash
  const path = location.pathname;
  const segments = path.split('/').filter(Boolean);

  // Return the first segment or null if there isn't one
  return segments.length > 0 ? segments[0] : null;
}

/**
 * 获取当前选中的布局段（类似 Next.js 的 useSelectedLayoutSegment）
 * @param {string} parentPath - 父路径，例如 '/app/:appId'
 * @returns {string|null} - 返回当前选中的段，如果没有匹配则返回 null
 */
export function useSelectedLayoutSegment(parentPath: string) {
  const location = useLocation();

  // 获取当前路径
  const { pathname } = location;

  // 检查当前路径是否匹配父路径
  const parentMatch = matchPath(`${parentPath}/*`, pathname);

  // 如果没有匹配到父路径，返回 null
  if (!parentMatch) {
    return null;
  }

  // 获取剩余的路径部分
  const remainingPath = parentMatch.params['*'];

  // 如果没有剩余路径，说明是根路径
  if (!remainingPath) {
    return '';
  }

  // 分割剩余路径，获取第一个段
  const segments = remainingPath.split('/');
  return segments[0];
}