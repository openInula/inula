function warning(condition: any, message: string) {
  if (condition) {
    if (console && typeof console.warn === 'function') {
      console.warn(message);
    }
  }
}

export default warning;