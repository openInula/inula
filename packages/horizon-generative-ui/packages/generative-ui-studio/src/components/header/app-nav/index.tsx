'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import produce from 'immer';
import { RiRobot2Fill, RiRobot2Line } from '@remixicon/react';
import Nav from '../nav';
import type { NavItem } from '../nav/nav-selector';
import { useAgents } from '@/service/agents';

const getKey = (
  pageIndex: number,
  previousPageData: AppListResponse,
  activeTab: string,
  keywords: string,
) => {
  if (!pageIndex || previousPageData.has_more) {
    const params: any = { url: 'apps', params: { page: pageIndex + 1, limit: 30, name: keywords } };

    if (activeTab !== 'all') params.params.mode = activeTab;
    else delete params.params.mode;

    return params;
  }
  return null;
};

const AppNav = () => {
  const selectedSegment = useLocation().pathname;
  const navigate = useNavigate();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const { data: appsData } = useAgents();
  const { id } = useParams();

  useEffect(() => {
    if (appsData) {
      const navItems = appsData.map((app) => {
        return {
          id: app.id,
          name: app.name,
          link: `/app/${app.id}/config`,
        };
      });
      setNavItems(navItems);
    }
  }, [appsData]);

  const curNav = navItems.length && id ? navItems.find((nav) => (nav.id === Number(id))) : null;

  const handleCreate = () => {
    navigate('/apps');
  };

  return (
    <>
      <Nav
        isApp
        icon={<RiRobot2Line className="h-4 w-4" />}
        activeIcon={<RiRobot2Fill className="h-4 w-4" />}
        text="Agents"
        activeSegment={['apps', 'app']}
        link="/apps"
        curNav={curNav}
        navs={navItems}
        createText="创建Agents"
        onCreate={handleCreate}
      />
    </>
  );
};

export default AppNav;
