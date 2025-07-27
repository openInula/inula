import chalk from 'chalk';

function createStyledLogger(chalkStyle) {
  return new Proxy(console.log, {
    apply(target, thisArg, argumentList) {
      const styledArgs = argumentList.map(arg => {
        if (typeof arg === 'string') {
          return chalkStyle(arg); // 应用 chalk 样式到字符串参数
        }
        return arg; // 对于非字符串参数，不使用chalk样式直接传递
      });
      return Reflect.apply(target, thisArg, styledArgs); // 调用原生 console.log
    },
  });
}

// 创建一个具有特定样式的 logger 实例
const errorLogger = createStyledLogger(chalk.red);
const normalLogger = createStyledLogger(chalk.green);
const warnLogger = createStyledLogger(chalk.yellow);

const LOG = {
  info: (...args) => {
    normalLogger(...args);
  },
  error: (...args) => {
    errorLogger(...args);
  },
  warn: (...args) => {
    warnLogger(...args);
  },
};

export default LOG;
