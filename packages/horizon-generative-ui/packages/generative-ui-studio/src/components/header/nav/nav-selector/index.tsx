'use client';
import { Fragment, useCallback } from 'react';
import { RiAddLine, RiArrowDownSLine, RiArrowRightSLine } from '@remixicon/react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash-es';
import cn from '@/utils/classnames';
import AppIcon from '@/components/base/app-icon';

export type NavItem = {
  id: number;
  name: string;
  link: string;
  icon: string;
  icon_background: string;
  icon_url: string | null;
  mode?: string;
};
export type INavSelectorProps = {
  navs: NavItem[];
  curNav?: Omit<NavItem, 'link'>;
  createText: string;
  isApp?: boolean;
  onCreate: (state: string) => void;
  onLoadmore?: () => void;
};

const NavSelector = ({ curNav, navs, createText, onCreate, onLoadmore }: INavSelectorProps) => {
  const navigate = useNavigate();

  const handleScroll = useCallback(
    debounce((e) => {
      if (typeof onLoadmore === 'function') {
        const { clientHeight, scrollHeight, scrollTop } = e.target;

        if (clientHeight + scrollTop > scrollHeight - 50) onLoadmore();
      }
    }, 50),
    [],
  );

  return (
    <div className="">
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <MenuButton
              className={cn(
                'hover:hover:bg-components-main-nav-nav-button-bg-active-hover group inline-flex h-7 w-full items-center justify-center rounded-[10px] pl-2 pr-2.5 text-sm font-semibold text-components-main-nav-nav-button-text-active',
                open && 'bg-components-main-nav-nav-button-bg-active',
              )}
            >
              <div className="max-w-[180px] truncate" title={curNav?.name}>
                {curNav?.name}
              </div>
              <RiArrowDownSLine
                className={cn(
                  'ml-1 h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100',
                  open && '!opacity-100',
                )}
                aria-hidden="true"
              />
            </MenuButton>
            <MenuItems
              className="
                absolute -left-11 right-0 mt-1.5 w-60 max-w-80
                origin-top-right divide-y divide-gray-100 rounded-lg bg-white
                shadow-lg
              "
            >
              <div
                className="overflow-auto px-1 py-1"
                style={{ maxHeight: '50vh' }}
                onScroll={handleScroll}
              >
                {navs.map((nav) => (
                  <MenuItem key={nav.id} disabled={curNav?.id === nav.id}>
                    <div
                      className="flex w-full cursor-pointer items-center truncate rounded-lg px-3 py-[6px] text-[14px] font-normal text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        navigate(nav.link);
                      }}
                      title={nav.name}
                    >
                      <div className="relative mr-2 h-6 w-6 rounded-md">
                        <AppIcon
                          size="tiny"
                          icon={nav.icon}
                          background={nav.icon_background}
                          imageUrl={nav.icon_url}
                        />
                      </div>
                      <div className="truncate">{nav.name}</div>
                    </div>
                  </MenuItem>
                ))}
              </div>
              <div className="w-full p-1">
                <MenuItem>
                  <div
                    onClick={() => onCreate('')}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-gray-100',
                    )}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-[0.5px] border-gray-200 bg-gray-50">
                      <RiAddLine className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="grow text-left text-[14px] font-normal text-gray-700">
                      {createText}
                    </div>
                  </div>
                </MenuItem>
              </div>
            </MenuItems>
          </>
        )}
      </Menu>
    </div>
  );
};

export default NavSelector;
