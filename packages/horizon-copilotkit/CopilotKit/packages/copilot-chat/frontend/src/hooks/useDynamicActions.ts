import { useDynamicActions as useCoreDynamicActions } from '@copilotkit/copilot-client'
import { page } from '@copilotkit/playwright-actuator';
import menuData from '../../menu-data/NCE-analysis.json';

// 菜单数据类型定义
export interface MenuData {
  id: string;
  name: string;
  primaryFunction: string;
  emit: string[];
}

/**
 * 根据菜单名称获取菜单数据
 * @param menuName 菜单名称（支持模糊匹配）
 * @returns 匹配的菜单数据，如果没找到则返回null
 */
export function getMenuByName(menuName: string): MenuData | null {
  const menus = menuData as MenuData[];
  
  // 先尝试精确匹配名称
  let matchedMenu = menus.find(menu => menu.id.toLowerCase() === menuName);
  
  return matchedMenu || null;
}

/**
 * 为现有的 DynamicAction 添加 parameters 和 handler 属性
 * @param action 原始的 DynamicAction
 * @param parameters 参数定义数组
 * @param handler 处理函数
 * @returns 增强后的 DynamicAction
 */
export function appendHandlerToAction(
  action: any
): any {
  return {
    ...action,
    parameters: {},
    handler: () => {
      const menu = getMenuByName(action.name);
      handleMenuOpen(menu);
    },
    executeOnClient: true
  };
}

/**
 * 处理菜单打开操作
 * @param menuItem 菜单项数据
 */
export const handleMenuOpen = async (menuItem: MenuData): Promise<void> => {
  const { emit } = menuItem;
  
  // 初始化 PIU
  if (!(window as any).isInitPIU) {
    (window as any).Prel.define({ 'abc@1.0.0': { config: { base: '/invgrpwebsite' } } });
    (window as any).Prel.start('abc', '1.0.0', [], (piu: any, _st: any) => {
      (window as any).abcPiu = piu;
      // 执行跳转（这会导致页面跳转和上下文销毁）
      (window as any).abcPiu.emit('userAction', ...emit);
    });
    (window as any).isInitPIU = true;
  } else {
    // 执行跳转（这会导致页面跳转和上下文销毁）
    (window as any).abcPiu.emit('userAction', ...emit);
  }

  // 增加3秒等待，给页面跳转更充足的时间
  console.log(`   ⏰ 等待3秒...`);
  await page.waitForTimeout(3000);

  try {
    await page.waitForLoadState('networkidle');
    console.log(`   ✅ 页面加载完成: ${page.url()}\n`);
  } catch (e) {
    console.log(`   ⚠️  页面加载超时，当前页面: ${page.url()}\n`);
  }
}

export function useDynamicActions() {
  const { dynamicActions, queryRelevantActions, registerDynamicActions } = useCoreDynamicActions({
    ragEndpoint: '/functions/search',
    enabled: true,
    searchLimit: 5,
    confidenceThreshold: 0.2,
  })

  return {
    dynamicActions: dynamicActions,
    queryDynamicActions: queryRelevantActions,
    addDynamicActions: (actions: any[]) => registerDynamicActions(actions),
    removeDynamicActions: () => registerDynamicActions([]),
    handleMenuOpen,
    // 为 DynamicAction 添加 parameters 和 handler
    appendHandlerToAction,
    // 菜单查询方法
    getMenuByName
  }
}