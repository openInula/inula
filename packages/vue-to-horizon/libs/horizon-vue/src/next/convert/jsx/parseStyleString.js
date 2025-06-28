function camelize(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

export function parseStyleString(styleStr) {
  const styles = {};
  styleStr.split(';').forEach(style => {
    if (style.trim()) {
      const [key, value] = style.split(':');
      styles[camelize(key.trim())] = value.trim();
    }
  });
  return styles;
}
