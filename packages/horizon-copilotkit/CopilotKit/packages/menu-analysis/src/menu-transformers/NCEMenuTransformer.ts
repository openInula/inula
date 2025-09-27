import { MenuItem } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 简单的菜单配置转换工具
 */
export class NCEMenuTransformer {
  
  /**
   * 从菜单配置JSON文件转换为MenuItem数组
   */
  static async transformFromJsonFile(filePath: string): Promise<MenuItem[]> {
    const absolutePath = path.resolve(filePath);
    const rawData = fs.readFileSync(absolutePath, 'utf-8');
    const rawConfig = JSON.parse(rawData);
    
    return this.transformFromObject(rawConfig);
  }
  
  /**
   * 从菜单配置对象转换为MenuItem数组
   */
  static transformFromObject(rawConfig: any): MenuItem[] {
    const menuItems: MenuItem[] = [];
    this.processLevel(rawConfig, menuItems, 0);
    return menuItems;
  }
  
  /**
   * 递归处理菜单层级
   */
  private static processLevel(
    menuLevel: any, 
    menuItems: MenuItem[], 
    level: number,
    parentId?: string
  ): void {
    Object.keys(menuLevel).forEach(key => {
      const rawItem = menuLevel[key];
      
      // 生成菜单ID（转换为kebab-case）
      const id = key;
      
      // 创建MenuItem
      const menuItem: MenuItem = {
        id,
        text: rawItem.name || key,
        level,
        parentId,
        hasSubmenu: !!(rawItem.subs || rawItem.actions),
        emit: rawItem.emit ? [...rawItem.emit] : [],
        href: rawItem.href
      };
      
      // 添加 preferNewWindow 字段支持
      if (typeof rawItem.preferNewWindow === 'boolean') {
        menuItem.preferNewWindow = rawItem.preferNewWindow;
      }
      
      menuItems.push(menuItem);
      
      // 递归处理子菜单
      if (rawItem.subs) {
        this.processLevel(rawItem.subs, menuItems, level + 1, id);
      }
      
      if (rawItem.actions) {
        this.processLevel(rawItem.actions, menuItems, level + 1, id);
      }
    });
  }
  
  /**
   * 过滤有emit动作的菜单项
   */
  static filterWithEmit(menuItems: MenuItem[]): MenuItem[] {
    return menuItems.filter(item => item.emit && item.emit.length > 0);
  }
  
  /**
   * 根据父ID获取子菜单
   */
  static getChildren(menuItems: MenuItem[], parentId: string): MenuItem[] {
    return menuItems.filter(item => item.parentId === parentId);
  }
  
  /**
   * 获取顶级菜单
   */
  static getTopLevel(menuItems: MenuItem[]): MenuItem[] {
    return menuItems.filter(item => !item.parentId);
  }
  
  /**
   * 生成TypeScript代码
   */
  static generateTypeScriptCode(menuItems: MenuItem[], varName: string = 'menuItems'): string {
    let code = `const ${varName}: MenuItem[] = [\n`;
    
    menuItems.forEach(item => {
      code += '  {\n';
      code += `    id: '${item.id}',\n`;
      code += `    text: '${item.text.replace(/'/g, "\\'")}',\n`;
      code += `    level: ${item.level},\n`;
      
      if (item.parentId) {
        code += `    parentId: '${item.parentId}',\n`;
      }
      
      code += `    hasSubmenu: ${item.hasSubmenu}`;
      
      if (item.emit && item.emit.length > 0) {
        code += ',\n';
        const emitStr = item.emit.map(e => `'${e.replace(/'/g, "\\\'")}'`).join(', ');
        code += `    emit: [${emitStr}]`;
      }
      
      // 添加 preferNewWindow 字段
      if (typeof item.preferNewWindow === 'boolean') {
        code += ',\n';
        code += `    preferNewWindow: ${item.preferNewWindow}`;
      }
      
      code += '\n';
      code += '  },\n';
    });
    
    code += '];';
    return code;
  }
  
  /**
   * 生成菜单统计信息
   */
  static getStatistics(menuItems: MenuItem[]): MenuStatistics {
    const byLevel = menuItems.reduce((acc, item) => {
      acc[item.level] = (acc[item.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return {
      total: menuItems.length,
      topLevel: menuItems.filter(item => !item.parentId).length,
      withEmit: menuItems.filter(item => item.emit && item.emit.length > 0).length,
      withSubmenu: menuItems.filter(item => item.hasSubmenu).length,
      byLevel
    };
  }
}

export interface MenuStatistics {
  total: number;
  topLevel: number;
  withEmit: number;
  withSubmenu: number;
  byLevel: Record<number, number>;
}