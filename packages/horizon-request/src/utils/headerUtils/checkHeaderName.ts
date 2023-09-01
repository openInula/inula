function checkHeaderName(str: string) {
  return /^[-_a-zA-Z]+$/.test(str.trim());
}

export default checkHeaderName;
