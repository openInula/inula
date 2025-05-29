'use client';
import { useTranslation } from 'react-i18next';
import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext, useContextSelector } from 'use-context-selector';
import {
  RiAccountCircleLine,
  RiArrowRightUpLine,
  RiBookOpenLine,
  RiGithubLine,
  RiGraduationCapFill,
  RiInformation2Line,
  RiLogoutBoxRLine,
  RiMap2Line,
  RiSettings3Line,
  RiStarLine,
} from '@remixicon/react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import Avatar from '@/components/base/avatar';
import cn from '@/utils/classnames';
import { useLogout, useUserProfile } from '@/service/auth';

export default function AppSelector() {
  const itemClassName = `
    flex items-center w-full h-9 pl-3 pr-2 text-text-secondary system-md-regular
    rounded-lg hover:bg-state-base-hover cursor-pointer gap-1
  `;
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();
  const logoutMutation = useLogout();
  const handleLogout = async () => {
    await logoutMutation.mutate();

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    navigate('/login');
  };

  if (!userProfile) {
    return null;
  }

  return (
    <div className="">
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <MenuButton
              className={cn(
                'inline-flex items-center rounded-[20px] p-0.5 hover:bg-background-default-dodge',
                open && 'bg-background-default-dodge',
              )}
            >
              <Avatar avatar={userProfile.avatar_url} name={userProfile.username} size={36} />
            </MenuButton>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems
                className="
                    absolute right-0 mt-1.5 w-60 max-w-80
                    origin-top-right divide-y divide-divider-subtle rounded-xl bg-components-panel-bg-blur
                    shadow-lg focus:outline-none
                  "
              >
                <MenuItem disabled>
                  <div className="flex flex-nowrap items-center py-[13px] pl-3 pr-2">
                    <div className="grow">
                      <div className="system-md-medium break-all text-text-primary">
                        {userProfile.username}
                      </div>
                      <div className="system-xs-regular break-all text-text-tertiary">
                        {userProfile.account}
                      </div>
                    </div>
                    <Avatar
                      avatar={userProfile.avatar_url}
                      name={userProfile.username}
                      size={36}
                      className="mr-3"
                    />
                  </div>
                </MenuItem>
                <MenuItem>
                  <div className="p-1" onClick={() => handleLogout()}>
                    <div
                      className={cn(
                        itemClassName,
                        'group justify-between',
                        'data-[active]:bg-state-base-hover',
                      )}
                    >
                      <RiLogoutBoxRLine className="size-4 shrink-0 text-text-tertiary" />
                      <div className="system-md-regular grow px-1 text-text-secondary">登出</div>
                    </div>
                  </div>
                </MenuItem>
              </MenuItems>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
}
