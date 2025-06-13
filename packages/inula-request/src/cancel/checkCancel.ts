// 检查是否为用户主动请求取消场景
function checkCancel(input: any): boolean {
  return input.name === 'CanceledError' || input.cancelFlag || false;
}

export default checkCancel;
