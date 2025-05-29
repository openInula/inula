'use client';

import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { RiDashboard2Fill, RiDashboard2Line } from '@remixicon/react';
import classNames from '@/utils/classnames';
import { useSelectedSegment } from '@/utils/router-utils';
type DebuggingNavProps = {
  className?: string;
};

const DebuggingNav = ({ className }: DebuggingNavProps) => {
  const selectedSegment = useSelectedSegment();
  const activated = selectedSegment === 'debugging';
  return (
    <Link
      to="/debugging/testset"
      className={classNames(
        className,
        'group',
        activated && 'bg-components-main-nav-nav-button-bg-active shadow-md',
        activated
          ? 'text-components-main-nav-nav-button-text-active'
          : 'text-components-main-nav-nav-button-text hover:bg-components-main-nav-nav-button-bg-hover',
      )}
    >
      {activated ? (
        <RiDashboard2Fill className="mr-2 h-4 w-4" />
      ) : (
        <RiDashboard2Line className="mr-2 h-4 w-4" />
      )}
      评测
    </Link>
  );
};

export default DebuggingNav;
