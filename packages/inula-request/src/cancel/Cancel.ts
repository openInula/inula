class Cancel {
  message?: string;
  cancelFlag?: boolean; // 用于标志是否为用户主动取消

  constructor(message?: string, cancelFlag?: boolean) {
    this.message = message;
    this.cancelFlag = cancelFlag;
  }
}

export default Cancel;
