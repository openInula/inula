export class ExpressionEvaluator {
  //递归地静态评估 AST 节点的值
  public evaluateExpression(
    node: any,
    component: any,
    scope: Map<string, any>,
    visited = new Set<any>(),
    dependenciesContext?: { dependencies: Set<string> }
  ): any {
    if (!node || visited.has(node)) { return null; }
    visited.add(node);
    if (visited.size > 50) {return null;}

    switch (node.type) {
        case 'NumericLiteral':
        case 'StringLiteral':
        case 'BooleanLiteral':
            return node.value;
        case 'NullLiteral':
            return null;
        case 'Identifier': {
            if (dependenciesContext) { dependenciesContext.dependencies.add(node.name); }
            if (visited.has(node.name)) { return null; }
            visited.add(node.name);
            const declaration = scope.get(node.name);
            if (declaration && declaration.init) {
                return this.evaluateExpression(declaration.init, component, scope, visited, dependenciesContext);
            }
            return null;
        }
        case 'ObjectExpression': {
            const obj: { [key: string]: any } = {};
            for (const prop of node.properties) {
                if (prop.type === 'ObjectProperty') {
                    const key = prop.key.name || prop.key.value;
                    obj[key] = this.evaluateExpression(prop.value, component, scope, new Set(visited), dependenciesContext);
                }
            }
            return obj;
        }
        case 'ArrayExpression': {
            let result: any[] = [];
            for (const elem of node.elements) {
                if (elem.type === 'SpreadElement') {
                    const spreadArr = this.evaluateExpression(elem.argument, component, scope, new Set(visited), dependenciesContext);
                    if (Array.isArray(spreadArr)) {
                        result = result.concat(spreadArr);
                    }
                } else {
                    result.push(this.evaluateExpression(elem, component, scope, new Set(visited), dependenciesContext));
                }
            }
            return result;
        }
        case 'TemplateLiteral': {
            let result = '';
            for (let i = 0; i < node.quasis.length; i++) {
                result += node.quasis[i].value.raw;
                if (i < node.expressions.length) {
                    const exprValue = this.evaluateExpression(node.expressions[i], component, scope, new Set(visited), dependenciesContext);
                    result += this.valueToString(exprValue);
                }
            }
            return result;
        }
        case 'BinaryExpression': {
            const left = this.evaluateExpression(node.left, component, scope, new Set(visited), dependenciesContext);
            const right = this.evaluateExpression(node.right, component, scope, new Set(visited), dependenciesContext);
            if (left === null || right === null) {return null;}
            switch (node.operator) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return left / right;
                case '%': return left % right;
                case '==': return left == right;
                case '===': return left === right;
                case '!=': return left != right;
                case '!==': return left !== right;
                case '<': return left < right;
                case '<=': return left <= right;
                case '>': return left > right;
                case '>=': return left >= right;
                default: return null;
            }
        }
        case 'UnaryExpression': {
            const argument = this.evaluateExpression(node.argument, component, scope, new Set(visited), dependenciesContext);
            if (argument === null) {return null;}
            switch (node.operator) {
                case '-': return -argument;
                case '+': return +argument;
                case '!': return !argument;
                case '~': return ~argument;
                case 'typeof': return typeof argument;
                default: return null;
            }
        }
        case 'LogicalExpression': {
            const left = this.evaluateExpression(node.left, component, scope, new Set(visited), dependenciesContext);
            if (node.operator === '&&') {
                return left && this.evaluateExpression(node.right, component, scope, new Set(visited), dependenciesContext);
            }
            if (node.operator === '||') {
                return left || this.evaluateExpression(node.right, component, scope, new Set(visited), dependenciesContext);
            }
            if (node.operator === '??') {
                return left ?? this.evaluateExpression(node.right, component, scope, new Set(visited), dependenciesContext);
            }
            return null;
        }
        case 'ConditionalExpression': {
            const test = this.evaluateExpression(node.test, component, scope, new Set(visited), dependenciesContext);
            if (test) {
                return this.evaluateExpression(node.consequent, component, scope, new Set(visited), dependenciesContext);
            } else {
                return this.evaluateExpression(node.alternate, component, scope, new Set(visited), dependenciesContext);
            }
        }
        case 'MemberExpression': {
            const objectValue = this.evaluateExpression(node.object, component, scope, visited, dependenciesContext);
            if (objectValue === null || typeof objectValue !== 'object') { return null; }

            let propertyName: string | number | null = null;
            if (node.computed) {
                propertyName = this.evaluateExpression(node.property, component, scope, visited, dependenciesContext);
            } else {
                propertyName = node.property.name;
            }

            if (propertyName !== null && propertyName !== undefined && objectValue.hasOwnProperty(propertyName)) {
                return (objectValue as any)[propertyName];
            }
            return null;
        }
        case 'CallExpression': {
            if (node.callee?.name === 'useState' && node.arguments.length > 0) {
                return this.evaluateExpression(node.arguments[0], component, scope, visited, dependenciesContext);
            }
            return null;
        }
        default:
            return null;
    }
  }
  //将值转换为适合在悬停提示中显示的字符串
  public valueToString(value: any, depth = 0): string {
    if (depth > 3) {return '...';}
    if (value === null) {return 'null';}
    if (value === undefined) {return 'undefined';}
    if (typeof value === 'string') {return `"${value}"`;}
    if (typeof value === 'number' || typeof value === 'boolean') {return String(value);}
    if (Array.isArray(value)) {
        if (value.length === 0) {return '[]';}
        const items = value.slice(0, 10).map(v => this.valueToString(v, depth + 1));
        return `[${items.join(', ')}${value.length > 10 ? ', ...' : ''}]`;
    }
    if (typeof value === 'object') {
        const properties = Object.entries(value);
        if (properties.length === 0) {return '{}';}
        const props = properties.slice(0, 5).map(([k, v]) => `${k}: ${this.valueToString(v, depth + 1)}`);
        return `{ ${props.join(', ')}${properties.length > 5 ? ', ...' : ''} }`;
    }
    return 'unknown';
  }
  //获取 AST 节点的简短描述
  public getValueDescription(node: any): string {
    switch (node.type) {
        case 'NumericLiteral':
            return `\`${node.value}\``;
        case 'StringLiteral':
            return `\`"${node.value}"\``;
        case 'Identifier':
            return `变量 \`${node.name}\``;
        case 'ArrowFunctionExpression':
            return '箭头函数';
        case 'CallExpression':
            return `${this.getCalleeName(node.callee)}()`;
        case 'BinaryExpression':
            const left = this.getOperandName(node.left);
            const right = this.getOperandName(node.right);
            return `\`${left} ${node.operator} ${right}\``;
        default:
            return node.type;
    }
  }
  //获取二元表达式中操作数的名称或字面值
  public getOperandName(operand: any): string {
    if (operand.type === 'Identifier') {return operand.name;}
    if (operand.type === 'NumericLiteral') {return operand.value.toString();}
    if (operand.type === 'StringLiteral') {return `"${operand.value}"`;}
    return operand.type;
  }
  //获取函数调用表达式中被调用函数的名称
  public getCalleeName(callee: any): string {
    if (!callee) {return '[未知]';}
    if (callee.type === 'Identifier') {return callee.name;}
    if (callee.type === 'MemberExpression') {
        return `${this.getCalleeName(callee.object)}.${callee.property.name}`;
    }
    return `[${callee.type}]`;
  }
}