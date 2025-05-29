'use client';
import { Link, useSearchParams } from 'react-router-dom';
import AppNav from './app-nav';
import ExploreNav from './explore-nav';
import LogoSite from '@/components/base/logo/logo-site';
import { useUserProfile } from '@/service/auth';
import AccountDropdown from './account-dropdown';
import DebuggingNav from './debugging-nav';

const navClassName = `
  flex items-center relative mr-0 sm:mr-3 px-3 h-8 rounded-xl
  font-medium text-sm
  cursor-pointer
`;

const Header = () => {
  const { data: userProfile } = useUserProfile();

  const [searchParams] = useSearchParams();
  const inSidebar = searchParams.get('inSidebar');
  
  if(inSidebar) {}
  return (
    <div className="flex flex-1 items-center justify-between bg-background-body px-4">
      <div className="flex items-center">
        <div className="flex w-64 shrink-0 items-center gap-1.5 self-stretch p-2 pl-3">
          <Link to="/apps" className="flex h-8 w-8 shrink-0 items-center justify-center gap-2">
            <LogoSite className="object-contain" />
          </Link>
          <div className="flex items-center gap-0.5 text-text-tertiary font-bold font-lg">
            {' '}
            意图UI
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <ExploreNav className={navClassName} />
        <AppNav />
        <DebuggingNav className={navClassName} />
      </div>
      <div className="flex shrink-0 items-center">
        <div className="mr-2"></div>
        <AccountDropdown />
      </div>
    </div>
  );
};
export default Header;
