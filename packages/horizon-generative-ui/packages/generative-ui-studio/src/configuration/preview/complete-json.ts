/**
 * 修复并补全截断的JSON字符串
 * @param {string} input - 可能被截断的JSON字符串
 * @return {string} - 修复后的JSON字符串
 */
export function repairJson(input: string) {
  let json = input;

  // 检测开头是否有 ```json 或类似标记并移除
  const codeBlockMatch = input.match(/^\s*```(?:json)?\s*\n([\s\S]+?)(?:\n\s*```\s*$|$)/);
  if (codeBlockMatch) {
    json = codeBlockMatch[1];
  }


  // 先检查是否已经是有效的JSON
  try {
    JSON.parse(json);
    return json; // 已经是有效的JSON
  } catch (e) {
    // 继续修复过程
  }

  // 用于跟踪JSON结构
  const stack = [];
  let inString = false;
  let escaped = false;
  let buffer = "";
  let lastPropName = "";
  let expectingColon = false;
  let expectingValue = false;
  let afterComma = false;
  let result = json;

  // 逐字符分析
  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    buffer += char;

    // 处理转义字符
    if (char === '\\' && !escaped) {
      escaped = true;
      continue;
    }

    // 处理字符串
    if (char === '"' && !escaped) {
      if (!inString) {
        // 开始字符串
        inString = true;
        lastPropName = "";
      } else {
        // 结束字符串
        inString = false;

        // 检查是否是属性名
        if (!expectingValue && stack[stack.length - 1] === '{') {
          expectingColon = true;
          // 提取属性名
          const match = buffer.match(/"([^"]+)"$/);
          if (match) {
            lastPropName = match[1];
          }
        }
      }
    }
    else if (inString && !escaped) {
      // 收集属性名
      if (expectingColon) {
        lastPropName += char;
      }
    }

    // 处理JSON结构符号（只在不在字符串内时）
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
        expectingColon = false;
        expectingValue = false;
        afterComma = false;
      }
      else if (char === '}') {
        if (stack[stack.length - 1] === '{') {
          stack.pop();
        } else {
          // 不匹配的结束括号，可能是错误
        }
        expectingColon = false;
        expectingValue = false;
        afterComma = false;
      }
      else if (char === ']') {
        if (stack[stack.length - 1] === '[') {
          stack.pop();
        } else {
          // 不匹配的结束括号，可能是错误
        }
        expectingColon = false;
        expectingValue = false;
        afterComma = false;
      }
      else if (char === ':') {
        expectingColon = false;
        expectingValue = true;
        afterComma = false;
      }
      else if (char === ',') {
        expectingValue = false;
        afterComma = true;
      }
      else if (!/\s/.test(char) && expectingValue) {
        // 非空白字符作为值
        expectingValue = false;
      }
    }

    escaped = (char === '\\' && !escaped);
  }

  // 开始修复过程

  // 1. 如果在字符串内结束，补全引号
  if (inString) {
    result += '"';
  }

  // 2. 如果期待冒号，添加冒号和默认值
  if (expectingColon) {
    result += ': ""';
  }

  // 3. 如果期待值，添加一个合适的默认值
  if (expectingValue) {
    // 根据属性名猜测合适的默认值
    let defaultValue = '""';

    if (lastPropName) {
      const propLower = lastPropName.toLowerCase();

      // 基于属性名推断类型
      if (propLower.includes("font") || propLower.includes("size")) {
        defaultValue = "14";
      }
      else if (propLower.includes("color")) {
        defaultValue = "\"#000000\"";
      }
      else if (propLower.includes("style") || propLower.includes("properties")) {
        defaultValue = "{}";
      }
      else if (propLower.includes("children")) {
        defaultValue = "[]";
      }
      else if (propLower.includes("type") || propLower.includes("content") ||
        propLower.includes("text") || propLower.includes("tag") ||
        propLower.includes("header")) {
        defaultValue = "\"\"";
      }
      else if (propLower.includes("align")) {
        defaultValue = "\"left\"";
      }
    }

    result += defaultValue;
  }

  // 4. 如果有逗号但后面没有内容，移除逗号
  if (afterComma && stack.length > 0) {
    const lastChar = result[result.length - 1];
    if (lastChar === ',') {
      result = result.slice(0, -1);
    }
  }

  // 5. 补全所有未闭合的结构
  while (stack.length > 0) {
    const opener = stack.pop();
    if (opener === '{') {
      result += '}';
    } else if (opener === '[') {
      result += ']';
    }
  }
  return result
}