import React, { useEffect, useState } from 'react';
import { RiLayoutRight2Line } from '@remixicon/react';
import NavLink from './navLink';
import type { NavIcon } from './navLink';
import cn from '@/utils/classnames';
import LayoutRight2LineMod from './LayoutRight2LineMod';

export type IAppDetailNavProps = {
  iconType?: 'app' | 'dataset' | 'notion';
  title: string;
  desc: string;
  isExternal?: boolean;
  icon: string;
  icon_background: string;
  navigation: Array<{
    name: string;
    href: string;
    icon: NavIcon;
    selectedIcon: NavIcon;
  }>;
  extraInfo?: (modeState: string) => React.ReactNode;
};

const AppDetailNav = ({
  title,
  desc,
  isExternal,
  icon,
  icon_background,
  navigation,
  extraInfo,
  iconType = 'app',
}: IAppDetailNavProps) => {
  const [appSidebarExpand, setAppSiderbarExpand] = useState('collapse');
  const expand = appSidebarExpand === 'expand';

  const handleToggle = (state: string) => {
    setAppSiderbarExpand(state === 'expand' ? 'collapse' : 'expand');
  };

  useEffect(() => {
    if (appSidebarExpand) {
      localStorage.setItem('app-detail-collapse-or-expand', appSidebarExpand);
      setAppSiderbarExpand(appSidebarExpand);
    }
  }, [appSidebarExpand, setAppSiderbarExpand]);

  return (
    <div
      className={`
        flex shrink-0 flex-col border-r border-divider-burn bg-background-default-subtle transition-all
        ${expand ? 'w-[216px]' : 'w-14'}
      `}
    >
      <nav
        className={`
          grow space-y-1
          ${expand ? 'p-4' : 'px-2.5 py-4'}
        `}
      >
        {navigation.map((item, index) => {
          return (
            <NavLink
              key={index}
              mode={appSidebarExpand}
              iconMap={{ selected: item.selectedIcon, normal: item.icon }}
              name={item.name}
              href={item.href}
            />
          );
        })}
      </nav>
      <div
        className={`
              shrink-0 py-3
              ${expand ? 'px-6' : 'px-4'}
            `}
      >
        <div
          className="flex h-6 w-6 cursor-pointer items-center justify-center text-gray-500"
          onClick={() => handleToggle(appSidebarExpand)}
        >
          {expand ? (
            <RiLayoutRight2Line className="h-5 w-5 text-components-menu-item-text" />
          ) : (
            <LayoutRight2LineMod className="h-5 w-5 text-components-menu-item-text" />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AppDetailNav);
