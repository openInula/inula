/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

/**
 * 将函数和属性设置到指定实例上
 * @param {Object} instance - 目标实例对象
 * @param {Array|Object} items - 要设置的函数或 [key, value] 键值对数组，或者包含方法的对象
 * @returns {Object} 返回修改后的实例（支持链式调用）
 */
export function setToInstance(instance, items) {
  // 如果是对象类型，直接遍历对象的键值对
  if (items && typeof items === 'object' && !Array.isArray(items)) {
    Object.entries(items).forEach(([key, value]) => {
      if (key) {
        instance[key] = value;
      } else {
        console.warn('跳过没有键名的项:', value);
      }
    });
    return instance;
  }

  // 处理数组类型的输入
  if (Array.isArray(items)) {
    items.forEach(item => {
      // 处理数组类型的 [key, value] 键值对
      if (Array.isArray(item)) {
        const [key, value] = item;
        if (key) {
          instance[key] = value;
        } else {
          console.warn('跳过没有键名的数组项:', item);
        }
        return;
      }

      // 处理函数类型
      if (typeof item === 'function') {
        const methodName = item.name;
        if (methodName) {
          instance[methodName] = item;
        } else {
          console.warn('跳过未命名的函数');
        }
        return;
      }

      // 处理无效的输入类型
      console.warn('跳过无效的项:', item);
    });
  } else {
    console.warn('无效的 items 类型:', items);
  }

  // 返回实例以支持链式调用
  return instance;
}

export function styles(...args) {
  // 主处理逻辑：处理所有参数并合并结果
  return args.reduce((acc, arg) => ({ ...acc, ...processArg(arg) }), {});
}

// 辅助函数：将破折号式命名转换为驼峰式命名
const toCamelCase = str => str.replace(/-([a-z])/g, g => g[1].toUpperCase());

// 辅助函数：处理单个样式字符串
const processStyleString = styleString => {
  const result = {};
  styleString.split(';').forEach(item => {
    const [key, value] = item.split(':').map(part => part.trim());
    if (key && value) {
      result[toCamelCase(key)] = value;
    }
  });
  return result;
};

// 辅助函数：处理样式对象
const processStyleObject = styleObject => {
  const result = {};
  for (let key in styleObject) {
    const camelKey = toCamelCase(key);
    let value = styleObject[key];
    // 处理数字值
    if (typeof value === 'number' && !isNaN(value)) {
      // 某些属性不需要单位，如 zIndex, opacity 等
      if (!['zIndex', 'opacity', 'fontWeight'].includes(camelKey)) {
        value = `${value}px`;
      }
    }
    result[camelKey] = value;
  }
  return result;
};

// 处理单个参数
const processArg = arg => {
  if (typeof arg === 'string') {
    return processStyleString(arg);
  } else if (Array.isArray(arg)) {
    return arg.reduce((acc, item) => ({ ...acc, ...processArg(item) }), {});
  } else if (typeof arg === 'object' && arg !== null) {
    return processStyleObject(arg);
  } else {
    return {}; // 处理无效输入
  }
};
